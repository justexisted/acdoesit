import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    console.log('check-session function called');
    
    // For now, we'll check if there's a valid user in the request
    // In production, you'd implement proper JWT token validation
    
    // Check if user has recent activity (within last 24 hours)
    const { url, serviceRoleKey } = getSupabaseConfig();
    
    // Get users with recent login activity OR recently created users (within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // First try to find users with recent login activity
    console.log('Checking for users with recent login activity...');
    console.log('Looking for users with last_login >=', twentyFourHoursAgo);
    
    let response = await fetch(`${url}/rest/v1/users?last_login=gte.${twentyFourHoursAgo}&select=*&order=last_login.desc&limit=1`, { headers: supabaseHeaders(serviceRoleKey) });

    console.log('Response status for last_login query:', response.status);
    
    if (response.ok) {
      const users = await response.json();
      console.log('Found users by last_login:', users);
      if (users && users.length > 0) {
        const user = users[0];
        console.log('Returning user found by last_login:', user);
        return {
          statusCode: 200,
          body: JSON.stringify({ user }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } else {
      console.log('last_login query failed, trying alternative approach...');
    }

    // If no recent login activity, check for recently created users
    console.log('Checking for recently created users...');
    console.log('Looking for users with created_at >=', twentyFourHoursAgo);
    
    response = await fetch(`${url}/rest/v1/users?created_at=gte.${twentyFourHoursAgo}&select=*&order=created_at.desc&limit=1`, { headers: supabaseHeaders(serviceRoleKey) });

    console.log('Response status for created_at query:', response.status);
    
    if (!response.ok) {
      console.log('Failed to query recently created users');
      return {
        statusCode: 200,
        body: JSON.stringify({ user: null }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const users = await response.json();
    console.log('Found users by created_at:', users);
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('Returning user found by created_at:', user);
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // If no recent users found, let's check all users and return the most recent one
    console.log('No recent users found, checking all users...');
    const allUsersResponse = await fetch(`${url}/rest/v1/users?select=*&order=created_at.desc&limit=1`, { headers: supabaseHeaders(serviceRoleKey) });
    
    if (allUsersResponse.ok) {
      const allUsers = await allUsersResponse.json();
      console.log('All users in database:', allUsers);
      
      if (allUsers && allUsers.length > 0) {
        const user = allUsers[0];
        console.log('Returning most recent user:', user);
        return {
          statusCode: 200,
          body: JSON.stringify({ user }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
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
