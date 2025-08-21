import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const table = 'leads';
  
    const query = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '200' });
    const resp = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 502, body: await resp.text() };
    const data = await resp.json();
    return { statusCode: 200, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } };
  }