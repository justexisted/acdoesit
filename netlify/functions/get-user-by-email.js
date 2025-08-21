export async function handler(event, context) {
  try {
    console.log('get-user-by-email function called');
    const { email } = JSON.parse(event.body || '{}');
    console.log('Looking for user with email:', email);
    
    if (!email) {
      return { statusCode: 400, body: 'Email is required' };
    }

    // Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    // Query users table by email
    const response = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
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
