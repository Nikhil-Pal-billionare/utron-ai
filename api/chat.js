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

  const { model, max_tokens, system, messages } = req.body;

  const fullMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://your-site.vercel.app',
      'X-Title': 'ULTRON AI'
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-sonnet-4-5',
      max_tokens: max_tokens || 1000,
      messages: fullMessages
    })
  });

  const data = await response.json();

  if (data.choices && data.choices[0]) {
    const converted = {
      content: [{ type: 'text', text: data.choices[0].message.content }]
    };
    return res.status(200).json(converted);
  }

  res.status(200).json(data);
}
