export async function handler(event, context) {
    if (!context.clientContext || !context.clientContext.user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    // Your Supabase configuration (same as other functions)
const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
const table = 'leads';
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };
  
    const query = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '200' });
    const resp = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!resp.ok) return { statusCode: 502, body: await resp.text() };
    const data = await resp.json();
    return { statusCode: 200, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } };
  }