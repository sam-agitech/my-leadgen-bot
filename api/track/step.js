import { sql, json, setCors, requireMethod } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = req.body || {};
    const conversationId = body.conversationId;
    const fromStep = body.fromStep ?? null;
    const toStep = body.toStep ?? null;
    const reason = body.reason ?? null;

    if (!conversationId) return json(res, 400, { error: 'Missing conversationId' });

    await sql`update conversations set last_seen_at = now() where id = ${conversationId}`;

    await sql`
      insert into step_events (conversation_id, from_step, to_step, reason)
      values (${conversationId}, ${fromStep}, ${toStep}, ${reason})
    `;

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

