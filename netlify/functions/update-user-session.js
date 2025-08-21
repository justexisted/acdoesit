import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    const { userId, lastLogin } = JSON.parse(event.body || '{}');
    
    if (!userId) {
      return { statusCode: 400, body: 'Missing required data: userId' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    
    // Update user's last login time
    const response = await fetch(`${url}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        last_login: lastLogin,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update user session:', errorText);
      return { statusCode: 502, body: `Failed to update user session: ${errorText}` };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error updating user session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
