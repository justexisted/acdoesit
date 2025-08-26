import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { readSessionCookie, verifyJWT } from './_auth.js';

function generateCode(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    // Auth: use session cookie
    const token = readSessionCookie(event);
    const payload = token ? verifyJWT(token) : null;
    if (!payload || !payload.sub) return { statusCode: 401, body: 'Unauthorized' };
    const referrerUserId = String(payload.sub);

    const { referee_reward_description } = JSON.parse(event.body || '{}');
    if (!referee_reward_description || String(referee_reward_description).trim().length === 0) {
      return { statusCode: 400, body: 'Missing referee_reward_description' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();

    // Ensure user exists
    const userResp = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(referrerUserId)}&select=id,email`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!userResp.ok) return { statusCode: 401, body: 'Unauthorized' };
    const users = await userResp.json();
    if (!Array.isArray(users) || users.length === 0) return { statusCode: 401, body: 'Unauthorized' };

    // Generate unique referral code; try a few times to avoid collision
    let referral_code = '';
    for (let i = 0; i < 5; i++) {
      const candidate = generateCode(10);
      const existsResp = await fetch(`${url}/rest/v1/referrals?referral_code=eq.${encodeURIComponent(candidate)}&select=id`, { headers: supabaseHeaders(serviceRoleKey) });
      const rows = existsResp.ok ? await existsResp.json() : [];
      if (!rows || rows.length === 0) { referral_code = candidate; break; }
    }
    if (!referral_code) return { statusCode: 500, body: 'Failed to generate code' };

    const referral = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      referrer_user_id: referrerUserId,
      referral_code,
      referee_reward_description: String(referee_reward_description).trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const insertResp = await fetch(`${url}/rest/v1/referrals`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(referral)
    });
    if (!insertResp.ok) {
      const text = await insertResp.text();
      return { statusCode: 502, body: `Insert failed: ${text}` };
    }
    const [row] = await insertResp.json();

    // Construct shareable link (frontend can also build this)
    const siteUrl = process.env.SITE_URL || '';
    const link = siteUrl ? `${siteUrl}/index.html?ref=${encodeURIComponent(referral_code)}` : `?ref=${encodeURIComponent(referral_code)}`;

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referral: row, link }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


