// Text-to-Speech proxy — uses OpenRouter's dedicated /audio/speech endpoint
// with Deepgram's free Flux TTS model so ULTRON can speak its replies out loud.
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { text, voice } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'No text provided to speak.' });
  }

  // Flux TTS input limits — trim very long replies so a single request
  // doesn't blow past provider limits or take too long.
  const input = text.slice(0, 4000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://your-site.vercel.app',
        'X-Title': 'ULTRON Voice'
      },
      body: JSON.stringify({
        model: 'deepgram/flux-tts:free',
        input,
        voice: voice || 'haley',
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      let errBody = {};
      try { errBody = await response.json(); } catch (_) {}
      return res.status(response.status).json({
        error: errBody?.error?.message || `TTS provider error (HTTP ${response.status})`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return res.status(200).json({ audio: base64Audio, format: 'mp3' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
