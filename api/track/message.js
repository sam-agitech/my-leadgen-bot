import { sql, json, setCors, requireMethod } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = req.body || {};
    const conversationId = body.conversationId;
    const role = body.role;
    const step = body.step || null;
    const contentText = body.contentText;

    if (!conversationId || !role || typeof contentText !== 'string') {
      return json(res, 400, { error: 'Missing fields' });
    }
    if (role !== 'user' && role !== 'assistant') {
      return json(res, 400, { error: 'Invalid role' });
    }

    await sql`update conversations set last_seen_at = now() where id = ${conversationId}`;

    await sql`
      insert into messages (conversation_id, role, step, content_text)
      values (${conversationId}, ${role}, ${step}, ${contentText})
    `;

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

