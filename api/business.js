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

  const { messages, businessContext } = req.body;

  const BUSINESS_SYSTEM = `You are ULTRON's Business Intelligence Core — a world-class AI business strategist, analyst, and advisor.

You act as a full-stack business manager who:
- Analyzes business data, revenue, expenses, KPIs
- Identifies problems, bottlenecks, and missed opportunities  
- Creates actionable growth strategies
- Reviews marketing, sales, operations, and finance
- Gives brutally honest assessments — no sugar coating
- Provides step-by-step execution plans
- Benchmarks against industry standards
- Forecasts trends and risks

${businessContext ? `BUSINESS CONTEXT PROVIDED:\n${businessContext}\n` : ''}

Format your responses with:
📊 DATA ANALYSIS — when analyzing numbers/metrics
🎯 STRATEGY — when giving strategic recommendations  
⚠️ RISK ALERT — when flagging problems
✅ ACTION PLAN — when giving next steps
💡 INSIGHT — key business intelligence

You are direct, data-driven, and results-focused. Think like McKinsey meets a battle-hardened entrepreneur. No generic advice — everything must be specific and actionable.`;

  const fullMessages = [
    { role: 'system', content: BUSINESS_SYSTEM },
    ...(messages || [])
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://your-site.vercel.app',
      'X-Title': 'ULTRON Business'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      max_tokens: 2000,
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
