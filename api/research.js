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

  const { query, messages } = req.body;

  const RESEARCH_SYSTEM = `You are ULTRON's Research Intelligence Module — a deep research engine like Perplexity but more powerful.

When given a research query:
1. Analyze the topic thoroughly using your knowledge
2. Provide structured, well-cited research with clear sections
3. Include: Overview, Key Findings, Deep Analysis, Current Trends, Expert Perspectives, Conclusion
4. Mention relevant research papers, studies, statistics where applicable
5. Format using clear headings with ## and bullet points
6. Always be comprehensive — this is a research tool, not a chat tool
7. If asked about recent events, clearly state your knowledge cutoff and what you know up to that point
8. End with "SOURCES & REFERENCES" section listing key sources/papers/orgs relevant to the topic

You are precise, academic, and thorough. No fluff — only high-value research intelligence.`;

  const fullMessages = [
    { role: 'system', content: RESEARCH_SYSTEM },
    ...(messages || []),
    { role: 'user', content: `RESEARCH QUERY: ${query}\n\nProvide a comprehensive, deep research report on this topic. Include all relevant data, studies, trends, and expert insights.` }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://your-site.vercel.app',
      'X-Title': 'ULTRON Research'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      max_tokens: 3000,
      messages: fullMessages
    })
  });

  const data = await response.json();

  if (data.choices && data.choices[0]) {
    return res.status(200).json({
      content: [{ type: 'text', text: data.choices[0].message.content }]
    });
  }

  res.status(200).json(data);
}
