export async function handler(event, context) {
  // Temporarily remove authentication check for testing
  // if (!context.clientContext || !context.clientContext.user) {
  //   return { statusCode: 401, body: 'Unauthorized' };
  // }

  try {
    console.log('save-user function called');
    console.log('Event body:', event.body);
    
    const { userData } = JSON.parse(event.body || '{}');
    
    console.log('Parsed userData:', userData);
    
    if (!userData || !userData.id || !userData.email) {
      console.log('Missing required user data:', { userData });
      return { statusCode: 400, body: 'Missing required user data' };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = 'users';
    
    console.log('Supabase config check:', {
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? 'configured' : 'missing',
      key: key ? 'configured' : 'missing'
    });
    
    if (!url || !key) {
      console.log('Supabase credentials not configured');
      return { statusCode: 500, body: 'Server not configured' };
    }

    // Prepare user data for database
    const dbUserData = {
      id: userData.id,
      first_name: userData.firstName || userData.first_name || 'Unknown',
      last_name: userData.lastName || userData.last_name || 'Unknown',
      email: userData.email,
      provider: userData.provider || 'email',
      created_at: userData.createdAt || userData.created_at || new Date().toISOString()
    };

    console.log('Prepared user data for database:', dbUserData);

    // Try to insert new user, if conflict (user exists), update
    const resp = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(dbUserData)
    });

    console.log('Supabase response status:', resp.status);
    console.log('Supabase response headers:', Object.fromEntries(resp.headers.entries()));

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Failed to save user:', errorText);
      return { statusCode: 502, body: `Failed to save user: ${errorText}` };
    }

    const responseBody = await resp.text();
    console.log('Supabase response body:', responseBody);

    console.log('User saved successfully to database');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
