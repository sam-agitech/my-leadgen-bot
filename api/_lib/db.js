import { sql } from '@vercel/postgres';

export { sql };

export function json(res, status, body) {
  return res.status(status).json(body);
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function requireMethod(req, res, method) {
  if (req.method === 'OPTIONS') return true;
  if (req.method !== method) {
    json(res, 405, { error: 'Method not allowed' });
    return false;
  }
  return true;
}

export function getAuthToken(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1];
  if (typeof req.query?.token === 'string') return req.query.token;
  return null;
}

export function requireAdmin(req, res) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    json(res, 500, { error: 'ADMIN_TOKEN not configured' });
    return false;
  }
  const got = getAuthToken(req);
  if (!got || got !== expected) {
    json(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

