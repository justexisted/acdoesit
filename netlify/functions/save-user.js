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
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      provider: userData.provider || 'email',
      created_at: userData.createdAt || new Date().toISOString()
    };

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
      console.error('Failed to save user:', await resp.text());
      return { statusCode: 502, body: 'Failed to save user' };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
