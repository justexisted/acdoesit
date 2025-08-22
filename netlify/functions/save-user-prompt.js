import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event) {
  try {
    const { userId, module, template, prompt, formData, propertyId } = JSON.parse(event.body || '{}');
    if (!userId || !prompt) return { statusCode: 400, body: 'Missing userId or prompt' };

    const { url, serviceRoleKey } = getSupabaseConfig();
    const body = {
      user_id: userId,
      module: module || null,
      template: template || null,
      prompt,
      form_data: formData || {},
      property_id: propertyId || null
    };
    const resp = await fetch(`${url}/rest/v1/user_prompts`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, body: text };
    }
    const rows = await resp.json();
    return { statusCode: 200, body: JSON.stringify(rows[0] || { success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


