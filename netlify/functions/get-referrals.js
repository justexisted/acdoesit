import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { readSessionCookie, verifyJWT } from './_auth.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

    const token = readSessionCookie(event);
    const payload = token ? verifyJWT(token) : null;
    if (!payload || !payload.sub) return { statusCode: 401, body: 'Unauthorized' };
    const userId = String(payload.sub);

    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/referrals?referrer_user_id=eq.${encodeURIComponent(userId)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 502, body: 'Failed to fetch referrals' };
    const rows = await resp.json();

    // Aggregate counts of completed signups per referral id (straightforward via status)
    const data = rows.map(r => ({
      ...r,
      completed_count: r.status === 'completed' ? 1 : 0
    }));

    const siteUrl = process.env.SITE_URL || '';
    const withLinks = data.map(r => ({
      ...r,
      link: siteUrl ? `${siteUrl}/index.html?ref=${encodeURIComponent(r.referral_code)}` : `?ref=${encodeURIComponent(r.referral_code)}`
    }));

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referrals: withLinks }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


