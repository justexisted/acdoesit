import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { verifyPasswordScrypt, createJWT, makeSessionCookie } from './_auth.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return { statusCode: 400, body: 'Missing credentials' };

    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 401, body: 'Invalid credentials' };
    const users = await resp.json();
    if (!Array.isArray(users) || users.length === 0) return { statusCode: 401, body: 'Invalid credentials' };
    const user = users[0];

    if (!user.password || !verifyPasswordScrypt(user.password, password)) {
      return { statusCode: 401, body: 'Invalid credentials' };
    }

    // Update last_login
    await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
    });

    const token = createJWT({ sub: user.id, email: user.email });
    const cookie = makeSessionCookie(token);
    return { statusCode: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, user: { id: user.id, email: user.email } }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


