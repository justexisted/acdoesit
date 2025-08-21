import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    console.log('get-user-analytics function called');
    const { url, serviceRoleKey } = getSupabaseConfig();
    console.log('Using Supabase config:', { url: url, key: serviceRoleKey ? 'configured' : 'missing' });
    
    // Fetch users from 'users' table
    let users = [];
    try {
      console.log('Fetching users from users table...');
      const usersResponse = await fetch(`${url}/rest/v1/users?select=*&order=created_at.desc`, { headers: supabaseHeaders(serviceRoleKey) });
      
      console.log('Users response status:', usersResponse.status);
      
      if (usersResponse.ok) {
        users = await usersResponse.json();
        console.log(`Found ${users.length} users in database`);
      } else {
        console.log('Failed to fetch users, table may not exist yet');
      }
    } catch (error) {
      console.log('Error fetching users:', error.message);
    }
    
    // If users table doesn't exist or is empty, return empty array
    if (!users || users.length === 0) {
      console.log('No users found, returning empty array');
      return {
        statusCode: 200,
        body: JSON.stringify([]),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Fetch activities from 'user_activity' table
    let activities = [];
    try {
      console.log('Fetching activities from user_activity table...');
      const activitiesResponse = await fetch(`${url}/rest/v1/user_activity?select=*&order=timestamp.desc`, { headers: supabaseHeaders(serviceRoleKey) });
      
      if (activitiesResponse.ok) {
        activities = await activitiesResponse.json();
        console.log(`Found ${activities.length} activities in database`);
      } else {
        console.log('Failed to fetch activities, table may not exist yet');
      }
    } catch (error) {
      console.log('Error fetching activities:', error.message);
    }

    // Fetch properties from 'user_properties' table
    let properties = [];
    try {
      console.log('Fetching properties from user_properties table...');
      const propertiesResponse = await fetch(`${url}/rest/v1/user_properties?select=*&order=created_at.desc`, { headers: supabaseHeaders(serviceRoleKey) });
      
      if (propertiesResponse.ok) {
        properties = await propertiesResponse.json();
        console.log(`Found ${properties.length} properties in database`);
      } else {
        console.log('Failed to fetch properties, table may not exist yet');
      }
    } catch (error) {
      console.log('Error fetching properties:', error.message);
    }

    // Process user analytics
    const userAnalytics = users.map(user => {
      const userActivities = activities.filter(activity => activity.user_id === user.id);
      const userProperties = properties.filter(prop => prop.user_id === user.id);
      
      // Calculate engagement metrics
      const totalActions = userActivities.length + userProperties.length;
      
      // Calculate last activity - prioritize most recent activity
      let lastActivity = null;
      let firstActivity = null;
      
      if (userActivities.length > 0) {
        // Sort activities by timestamp (most recent first)
        const sortedActivities = userActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        lastActivity = sortedActivities[0].timestamp;
        firstActivity = sortedActivities[sortedActivities.length - 1].timestamp;
      }
      
      // If no activities but has properties, use property creation time
      if (!lastActivity && userProperties.length > 0) {
        const sortedProperties = userProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        lastActivity = sortedProperties[0].created_at;
      }
      
      // If still no last activity, use user creation time
      if (!lastActivity) {
        lastActivity = user.created_at;
      }
      
      // Calculate feature usage
      const featureUsage = {};
      userActivities.forEach(activity => {
        if (activity.action) {
          featureUsage[activity.action] = (featureUsage[activity.action] || 0) + 1;
        }
      });
      
      if (userProperties.length > 0) {
        featureUsage['properties_saved'] = userProperties.length;
        featureUsage['ai_prompt_builder'] = (featureUsage['ai_prompt_builder'] || 0) + userProperties.length;
      }
      
      // Calculate location (default to San Diego for now)
      const location = {
        city: 'San Diego',
        region: 'CA',
        country: 'US'
      };
      
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        created_at: user.created_at,
        provider: user.provider,
        total_actions: totalActions,
        last_activity: lastActivity,
        first_activity: firstActivity,
        feature_usage: featureUsage,
        location: location,
        engagement_score: totalActions > 0 ? Math.min(100, totalActions * 10) : 0,
        properties_count: userProperties.length
      };
    });

    console.log(`Processed ${userAnalytics.length} users for analytics`);
    
    return {
      statusCode: 200,
      body: JSON.stringify(userAnalytics),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error in get-user-analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
