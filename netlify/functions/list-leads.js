export async function handler(event, context) {
    if (!context.clientContext || !context.clientContext.user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = process.env.SUPABASE_TABLE || 'leads';
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };
  
    const query = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '200' });
    const resp = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!resp.ok) return { statusCode: 502, body: await resp.text() };
    const data = await resp.json();
    return { statusCode: 200, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } };
  }