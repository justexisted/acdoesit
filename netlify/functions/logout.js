import { clearSessionCookie } from './_auth.js';
import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    // Optional: clear last_login
    try {
      const { userId } = JSON.parse(event.body || '{}');
      if (userId) {
        const { url, serviceRoleKey } = getSupabaseConfig();
        await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ last_login: null, updated_at: new Date().toISOString() })
        });
      }
    } catch {}
    return { statusCode: 200, headers: { 'Set-Cookie': clearSessionCookie(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


