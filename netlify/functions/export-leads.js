export async function handler(event, context) {
    if (!context.clientContext || !context.clientContext.user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = process.env.SUPABASE_TABLE || 'leads';
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };
  
    const query = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '1000' });
    const resp = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
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