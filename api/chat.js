export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let messages = req.body.messages;
    let finalData = null;

    // Loop to handle tool use (web search) automatically
    for (let i = 0; i < 5; i++) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...req.body, messages })
      });

      const data = await response.json();

      // If no tool use, we have the final answer
      if (data.stop_reason !== 'tool_use') {
        finalData = data;
        break;
      }

      // Add assistant's tool use message to history
      messages = [...messages, { role: 'assistant', content: data.content }];

      // Add tool results for each tool use block
      const toolResults = data.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: b.type === 'web_search' ? JSON.stringify(b.output || '') : 'Done.'
        }));

      messages = [...messages, { role: 'user', content: toolResults }];
    }

    return res.status(200).json(finalData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
