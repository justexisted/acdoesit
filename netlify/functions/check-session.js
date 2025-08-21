export async function handler(event, context) {
  try {
    // For now, we'll check if there's a valid user in the request
    // In production, you'd implement proper JWT token validation
    
    // Check if user has recent activity (within last 24 hours)
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    // Get users with recent login activity
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const response = await fetch(`${url}/rest/v1/users?last_login=gte.${twentyFourHoursAgo}&select=*&order=last_login.desc&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ user: null }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const users = await response.json();
    
    if (users && users.length > 0) {
      const user = users[0];
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: null }),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error checking session:', error);
    return {
      statusCode: 200,
      body: JSON.stringify({ user: null }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
