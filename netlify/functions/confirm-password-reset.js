import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { hashPasswordScrypt } from './_auth.js';

export async function handler(event) {
  try {
    const { token, newPassword } = JSON.parse(event.body || '{}');
    if (!token || !newPassword) return { statusCode: 400, body: 'Missing token or newPassword' };

    const { url, serviceRoleKey } = getSupabaseConfig();

    // Find user by reset_token and not expired
    const nowIso = new Date().toISOString();
    const resp = await fetch(`${url}/rest/v1/users?reset_token=eq.${encodeURIComponent(token)}&reset_token_expires_at=gt.${nowIso}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 404, body: 'Invalid token' };
    const users = await resp.json();
    if (!Array.isArray(users) || users.length === 0) return { statusCode: 404, body: 'Invalid or expired token' };
    const user = users[0];

    // Update password and clear token
    const patch = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ password: hashPasswordScrypt(newPassword), reset_token: null, reset_token_expires_at: null, updated_at: new Date().toISOString() })
    });
    if (!patch.ok) {
      const text = await patch.text();
      return { statusCode: 502, body: `Failed to update password: ${text}` };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


