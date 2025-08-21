import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    const { userId, newPassword } = JSON.parse(event.body || '{}');
    if (!userId || !newPassword) {
      return { statusCode: 400, body: 'Missing userId or newPassword' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();

    const resp = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ password: newPassword, updated_at: new Date().toISOString() })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, body: `Failed to set password: ${text}` };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


