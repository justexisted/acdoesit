import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    console.log('debug-users function called');
    const { url, serviceRoleKey } = getSupabaseConfig();
    
    // Get all users to see what's actually in the table
    const response = await fetch(`${url}/rest/v1/users?select=*&limit=10`, { headers: supabaseHeaders(serviceRoleKey) });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to query users:', errorText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Failed to query database', details: errorText }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const users = await response.json();
    console.log('All users in database:', users);
    
    // Also check the table structure
    const structureResponse = await fetch(`${url}/rest/v1/users?select=*&limit=1`, { headers: supabaseHeaders(serviceRoleKey) });
    
    if (structureResponse.ok) {
      const sampleUser = await structureResponse.json();
      console.log('Sample user structure:', sampleUser);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        totalUsers: users.length,
        users: users,
        message: 'Database debug complete'
      }),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error debugging users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
