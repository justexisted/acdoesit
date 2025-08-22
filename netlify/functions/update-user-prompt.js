import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    const { userId, promptId, prompt, module, template } = JSON.parse(event.body || '{}');
    if (!userId || !promptId || !prompt) return { statusCode: 400, body: 'Missing userId, promptId or prompt' };
    const { url, serviceRoleKey } = getSupabaseConfig();
    const resp = await fetch(`${url}/rest/v1/user_prompts?id=eq.${encodeURIComponent(promptId)}&user_id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ prompt, module: module || null, template: template || null, updated_at: new Date().toISOString() })
    });
    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: 502, body: t };
    }
    const rows = await resp.json();
    return { statusCode: 200, body: JSON.stringify(rows[0] || { success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


