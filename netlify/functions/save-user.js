import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { hashPasswordScrypt } from './_auth.js';

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

    const { url, serviceRoleKey } = getSupabaseConfig();
    const table = 'users';
    
    console.log('Using Supabase config:', { url, table });

    // Prepare minimal user data for initial insert
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
    const checkResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, { headers: supabaseHeaders(serviceRoleKey) });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists, updating...');
        
        // Update existing user
        const updateResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
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
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(dbUserData)
    });

    console.log('Insert response status:', insertResponse.status);

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Failed to insert user:', insertResponse.status, errorText);
      return { statusCode: 502, body: JSON.stringify({ error: 'Insert failed', status: insertResponse.status, details: errorText }) };
    }

    console.log('User saved successfully to database');
    // If password provided, set it and update last_login
    if (userData.password) {
      try {
        const patch = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(dbUserData.id)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ password: hashPasswordScrypt(userData.password), last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
        });
        if (!patch.ok) {
          console.log('Password patch failed with status:', patch.status);
        }
      } catch (e) {
        console.log('Password patch error:', e.message);
      }
    }
    console.log('Final user data saved:', dbUserData);
    return { statusCode: 200, body: JSON.stringify({ success: true, action: 'created' }) };

  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: error.message }) };
  }
}
