import { sql, json, setCors, requireAdmin } from '../../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const id = req.query?.id;
    if (!id) return json(res, 400, { error: 'Missing id' });

    const conv = await sql`select * from conversations where id = ${id}`;
    if (!conv.rows[0]) return json(res, 404, { error: 'Not found' });

    const lead = await sql`select * from leads where conversation_id = ${id}`;
    const messages = await sql`
      select created_at, role, step, content_text
      from messages
      where conversation_id = ${id}
      order by created_at asc
    `;
    const steps = await sql`
      select created_at, from_step, to_step, reason
      from step_events
      where conversation_id = ${id}
      order by created_at asc
    `;

    return json(res, 200, {
      conversation: conv.rows[0],
      lead: lead.rows[0] || null,
      messages: messages.rows,
      stepEvents: steps.rows
    });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

