// Netlify Function: Save submission to Supabase
// Requires environment variables set in Netlify:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE (service role key), SUPABASE_TABLE (default 'leads')

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { name, email, role, price } = JSON.parse(event.body || '{}');
    if (!name || !email) {
      return { statusCode: 400, body: 'Missing name or email' };
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = process.env.SUPABASE_TABLE || 'leads';
    if (!url || !key) {
      return { statusCode: 500, body: 'Server not configured' };
    }
    const payload = { name, email, role, price };
    const resp = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, body: `Upstream error: ${text}` };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
}


