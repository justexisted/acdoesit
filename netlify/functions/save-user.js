export async function handler(event, context) {
  try {
    console.log('save-user function called');
    console.log('Event body:', event.body);
    
    const { userData } = JSON.parse(event.body || '{}');
    console.log('Parsed userData:', userData);
    
    if (!userData || !userData.email) {
      console.log('Missing required data:', userData);
      return { statusCode: 400, body: 'Missing required data: userData with email' };
    }

    // Your Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzEzNzUsImV4cCI6MjA3MTEwNzM3NX0.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    const table = 'users';
    
    console.log('Using Supabase config:', { 
      url: url, 
      key: key ? 'configured' : 'missing', 
      table: table 
    });

    // Prepare user data for database
    const dbUserData = {
      id: userData.id,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      email: userData.email,
      provider: userData.provider || 'email',
      created_at: userData.createdAt || userData.created_at || new Date().toISOString()
    };

    console.log('Prepared user data for database:', dbUserData);

    // Check if user already exists
    const checkResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, {
      headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}` 
      }
    });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists, updating...');
        
        // Update existing user
        const updateResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, {
          method: 'PATCH',
          headers: { 
            'apikey': key, 
            'Authorization': `Bearer ${key}`, 
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            first_name: dbUserData.first_name,
            last_name: dbUserData.last_name,
            provider: dbUserData.provider,
            updated_at: new Date().toISOString()
          })
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Failed to update user:', errorText);
          return { statusCode: 502, body: `Failed to update user: ${errorText}` };
        }

        console.log('User updated successfully');
        return { statusCode: 200, body: JSON.stringify({ success: true, action: 'updated' }) };
      }
    }

    // Insert new user
    const insertResponse = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}`, 
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(dbUserData)
    });

    console.log('Insert response status:', insertResponse.status);
    console.log('Insert response headers:', Object.fromEntries(insertResponse.headers.entries()));

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Failed to insert user:', errorText);
      return { statusCode: 502, body: `Failed to insert user: ${errorText}` };
    }

    console.log('User saved successfully to database');
    return { statusCode: 200, body: JSON.stringify({ success: true, action: 'created' }) };

  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: `Internal server error: ${error.message}` };
  }
}
