import { sql, json, setCors, requireAdmin } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    // Simple funnel: count distinct conversations reaching each step
    const steps = await sql`
      select
        to_step as step,
        count(distinct conversation_id)::int as conversations
      from step_events
      where to_step is not null
      group by to_step
      order by conversations desc
    `;

    const totals = await sql`
      select
        (select count(*)::int from conversations) as conversations,
        (select count(*)::int from messages) as messages,
        (select count(*)::int from leads where email is not null) as leads_with_email
    `;

    return json(res, 200, { totals: totals.rows[0], byStep: steps.rows });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

