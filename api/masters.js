// Vercel Serverless Function — shared master lists (drugs & vendors)
// Stores data in Upstash Redis (via Vercel KV / Storage integration).
// Anyone with the team password can read and write.

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-team-password');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const teamPassword = process.env.TEAM_PASSWORD || '';
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(500).json({
      error: 'Shared storage not configured. In Vercel: Storage tab → Create → Upstash KV → Connect to this project. That auto-adds KV_REST_API_URL and KV_REST_API_TOKEN.',
    });
  }

  // Team password check
  if (teamPassword) {
    const provided = req.headers['x-team-password'] || '';
    if (provided !== teamPassword) {
      return res.status(401).json({ error: 'Invalid or missing team password' });
    }
  }

  try {
    if (req.method === 'GET') {
      const [drugs, vendors, updatedAt] = await Promise.all([
        kv(kvUrl, kvToken, ['GET', 'pbx:drugs']),
        kv(kvUrl, kvToken, ['GET', 'pbx:vendors']),
        kv(kvUrl, kvToken, ['GET', 'pbx:updatedAt']),
      ]);
      return res.status(200).json({
        drugs: drugs || '',
        vendors: vendors || '',
        updatedAt: updatedAt || null,
      });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const drugs = typeof body.drugs === 'string' ? body.drugs : '';
      const vendors = typeof body.vendors === 'string' ? body.vendors : '';
      const now = new Date().toISOString();
      await Promise.all([
        kv(kvUrl, kvToken, ['SET', 'pbx:drugs', drugs]),
        kv(kvUrl, kvToken, ['SET', 'pbx:vendors', vendors]),
        kv(kvUrl, kvToken, ['SET', 'pbx:updatedAt', now]),
      ]);
      return res.status(200).json({ ok: true, updatedAt: now });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

async function kv(url, token, command) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || `KV error ${r.status}`);
  return data.result;
}
