export async function handler(event, context) {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { userData } = JSON.parse(event.body || '{}');
    
    if (!userData || !userData.id || !userData.email) {
      return { statusCode: 400, body: 'Missing required user data' };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = 'users';
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    // Prepare user data for database
    const dbUserData = {
      id: userData.id,
      first_name: userData.firstName || userData.first_name || 'Unknown',
      last_name: userData.lastName || userData.last_name || 'Unknown',
      email: userData.email,
      provider: userData.provider || 'email',
      created_at: userData.createdAt || userData.created_at || new Date().toISOString()
    };

    console.log('Saving user to database:', {
      id: dbUserData.id,
      email: dbUserData.email,
      provider: dbUserData.provider,
      first_name: dbUserData.first_name,
      last_name: dbUserData.last_name
    });

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

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Failed to save user:', errorText);
      return { statusCode: 502, body: `Failed to save user: ${errorText}` };
    }

    console.log('User saved successfully to database');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
