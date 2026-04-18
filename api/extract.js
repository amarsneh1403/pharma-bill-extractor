// Vercel Serverless Function — proxies requests to Anthropic's API
// The API key lives here (in Vercel env vars), NEVER in the browser.
// Requests are authorized with a shared team password.

export const config = {
  maxDuration: 60, // allow up to 60s for large PDFs
};

export default async function handler(req, res) {
  // CORS (same-origin usually, but harmless to include)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-team-password');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const teamPassword = process.env.TEAM_PASSWORD || '';

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server not configured. Set ANTHROPIC_API_KEY in Vercel Environment Variables.',
    });
  }

  // Team password check (skip if env var is empty — open mode)
  if (teamPassword) {
    const provided = req.headers['x-team-password'] || '';
    if (provided !== teamPassword) {
      return res.status(401).json({ error: 'Invalid or missing team password' });
    }
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();
    res.status(upstream.status).setHeader('content-type', 'application/json').send(text);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
}
