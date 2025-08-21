import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    console.log('get-user-by-email function called');
    const { email } = JSON.parse(event.body || '{}');
    console.log('Looking for user with email:', email);
    
    if (!email) {
      return { statusCode: 400, body: 'Email is required' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    
    // Query users table by email
    const response = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: supabaseHeaders(serviceRoleKey)
    });

    if (!response.ok) {
      return { statusCode: response.status, body: 'Failed to query database' };
    }

    const users = await response.json();
    console.log('Found users:', users);
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('Returning user:', user);
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: { 'Content-Type': 'application/json' }
      };
    } else {
      console.log('No users found with email:', email);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
  } catch (error) {
    console.error('Error getting user by email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
