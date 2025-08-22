import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) return { statusCode: 400, body: 'Missing userId' };

    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/user_prompts?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`, {
      headers: supabaseHeaders(serviceRoleKey)
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, body: text };
    }
    const rows = await resp.json();
    return { statusCode: 200, body: JSON.stringify(rows), headers: { 'Content-Type': 'application/json' } };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


