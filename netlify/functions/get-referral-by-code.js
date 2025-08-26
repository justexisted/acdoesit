import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
    const code = (event.queryStringParameters && event.queryStringParameters.code) || '';
    if (!code) return { statusCode: 400, body: 'Missing code' };

    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/referrals?referral_code=eq.${encodeURIComponent(code)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 502, body: 'Lookup failed' };
    const rows = await resp.json();
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) return { statusCode: 404, body: 'Not found' };

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referral: { referral_code: row.referral_code, referee_reward_description: row.referee_reward_description, status: row.status } }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


