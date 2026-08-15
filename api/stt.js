// Speech-to-Text proxy — sends recorded mic audio to OpenRouter's chat
// completions endpoint using NVIDIA's free Nemotron 3 Nano Omni (reasoning)
// model, which natively understands audio, so ULTRON can understand what
// the user says out loud.
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

  const { audio, format } = req.body || {};

  if (!audio) {
    return res.status(400).json({ error: 'No audio data provided.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://your-site.vercel.app',
        'X-Title': 'ULTRON Voice'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content:
              'You are a precise speech transcription engine. Listen to the attached audio and output ONLY the exact words spoken, in the language they were spoken in. Do not translate, summarize, comment, or add any extra text, labels, or quotation marks — output the raw transcription and nothing else. If the audio contains no intelligible speech, output nothing.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: { data: audio, format: format || 'webm' }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const text = (data.choices[0].message.content || '').trim();
      return res.status(200).json({ text });
    }

    return res.status(200).json({ text: '', error: data.error?.message || 'Could not understand the audio.' });
  } catch (err) {
    return res.status(500).json({ text: '', error: err.message });
  }
}
