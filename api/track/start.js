import crypto from 'node:crypto';
import { sql, json, setCors, requireMethod } from '../_lib/db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const body = req.body || {};
    const conversationId = crypto.randomUUID();

    await sql`
      insert into conversations (
        id, landing_url, referrer,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        user_agent
      ) values (
        ${conversationId},
        ${body.landingUrl || null},
        ${body.referrer || null},
        ${body.utmSource || null},
        ${body.utmMedium || null},
        ${body.utmCampaign || null},
        ${body.utmTerm || null},
        ${body.utmContent || null},
        ${body.userAgent || null}
      )
    `;

    return json(res, 200, { conversationId });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  }
}

