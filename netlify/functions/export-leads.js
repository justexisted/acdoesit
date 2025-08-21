import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const table = 'leads';
  
    const query = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '1000' });
    const resp = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!resp.ok) return { statusCode: 502, body: await resp.text() };
    const rows = await resp.json();
  
    const headers = ['created_at','name','email','want','role','problem','price'];
    const esc = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    const lines = [headers.join(',')];
    rows.forEach(r => lines.push(headers.map(h => esc(r[h])).join(',')));
    const csv = lines.join('\n');
  
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="leads.csv"' },
      body: csv
    };
  }