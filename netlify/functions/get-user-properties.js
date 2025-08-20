export async function handler(event, context) {
  try {
    console.log('get-user-properties function called');
    
    const { userId } = JSON.parse(event.body || '{}');
    
    if (!userId) {
      return { statusCode: 400, body: 'Missing required field: userId' };
    }

    // Use the user's existing Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzEzNzUsImV4cCI6MjA3MTEwNzM3NX0.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    const table = 'user_properties';
    
    console.log('Fetching properties for user:', userId);

    // Query properties for the specific user
    const query = new URLSearchParams({ 
      select: '*', 
      user_id: `eq.${userId}`,
      order: 'created_at.desc'
    });
    
    const response = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
      headers: { 
        apikey: key, 
        Authorization: `Bearer ${key}` 
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch properties:', errorText);
      return { statusCode: 502, body: `Failed to fetch properties: ${errorText}` };
    }

    const properties = await response.json();
    console.log(`Found ${properties.length} properties for user ${userId}`);

    return { 
      statusCode: 200, 
      body: JSON.stringify(properties), 
      headers: { 'Content-Type': 'application/json' } 
    };
  } catch (error) {
    console.error('Error getting user properties:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
