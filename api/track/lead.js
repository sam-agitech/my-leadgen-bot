import { sql, json, setCors, requireMethod } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = req.body || {};
    const conversationId = body.conversationId;
    if (!conversationId) return json(res, 400, { error: 'Missing conversationId' });

    const website = body.website ?? null;
    const clientProblem = body.clientProblem ?? null;
    const scope = body.scope ?? null;
    const modules = body.modules ?? null;
    const email = body.email ?? null;
    const status = body.status ?? 'new';

    await sql`update conversations set last_seen_at = now() where id = ${conversationId}`;

    await sql`
      insert into leads (conversation_id, website, client_problem, scope, modules, email, status)
      values (${conversationId}, ${website}, ${clientProblem}, ${scope}, ${modules}, ${email}, ${status})
      on conflict (conversation_id) do update set
        website = coalesce(excluded.website, leads.website),
        client_problem = coalesce(excluded.client_problem, leads.client_problem),
        scope = coalesce(excluded.scope, leads.scope),
        modules = coalesce(excluded.modules, leads.modules),
        email = coalesce(excluded.email, leads.email),
        status = coalesce(excluded.status, leads.status),
        updated_at = now()
    `;

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

