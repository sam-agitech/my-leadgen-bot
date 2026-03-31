import { sql, json, setCors, requireAdmin } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const limit = Math.min(parseInt(req.query?.limit || '50', 10) || 50, 200);
    const offset = Math.max(parseInt(req.query?.offset || '0', 10) || 0, 0);

    const rows = await sql`
      select
        c.id,
        c.created_at,
        c.last_seen_at,
        c.landing_url,
        c.referrer,
        c.utm_source,
        c.utm_medium,
        c.utm_campaign,
        l.email as lead_email,
        l.website as lead_website,
        l.status as lead_status
      from conversations c
      left join leads l on l.conversation_id = c.id
      order by c.created_at desc
      limit ${limit} offset ${offset}
    `;

    const total = await sql`select count(*)::int as count from conversations`;

    return json(res, 200, { total: total.rows[0].count, limit, offset, rows: rows.rows });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

