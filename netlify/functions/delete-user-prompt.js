import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    const { userId, promptId } = JSON.parse(event.body || '{}');
    if (!userId || !promptId) return { statusCode: 400, body: 'Missing userId or promptId' };
    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/user_prompts?id=eq.${encodeURIComponent(promptId)}&user_id=eq.${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: { ...supabaseHeaders(serviceRoleKey), Prefer: 'return=minimal' }
    });
    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: 502, body: t };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


