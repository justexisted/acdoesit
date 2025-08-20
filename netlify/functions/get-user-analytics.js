export async function handler(event, context) {
  try {
    console.log('get-user-analytics function called');
    
    // Use the user's existing Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzEzNzUsImV4cCI6MjA3MTEwNzM3NX0.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    console.log('Using Supabase config:', {
      url: url,
      key: key ? 'configured' : 'missing'
    });
    
    // First, try to get users from the users table
    let users = [];
    try {
      console.log('Attempting to fetch users from Supabase...');
      const usersQuery = new URLSearchParams({ 
        select: '*', 
        order: 'created_at.desc', 
        limit: '1000' 
      });
      
      const usersResp = await fetch(`${url}/rest/v1/users?${usersQuery.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      console.log('Users response status:', usersResp.status);
      
      if (usersResp.ok) {
        users = await usersResp.json();
        console.log(`Found ${users.length} users in Supabase database`);
      } else {
        const errorText = await usersResp.text();
        console.log('Users table not found or empty:', errorText);
        
        // If users table doesn't exist, return empty array
        return { 
          statusCode: 200, 
          body: JSON.stringify([]), 
          headers: { 'Content-Type': 'application/json' } 
        };
      }
    } catch (error) {
      console.log('Error fetching users from database:', error.message);
      return { 
        statusCode: 200, 
        body: JSON.stringify([]), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }

    // If no users in database, return empty array
    if (!users || users.length === 0) {
      console.log('No users found in database, returning empty array');
      return { 
        statusCode: 200, 
        body: JSON.stringify([]), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }

    // Get user activity data
    let activities = [];
    try {
      console.log('Attempting to fetch user activity from Supabase...');
      const activityQuery = new URLSearchParams({ 
        select: '*', 
        order: 'timestamp.desc', 
        limit: '10000' 
      });
      
      const activityResp = await fetch(`${url}/rest/v1/user_activity?${activityQuery.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      console.log('Activity response status:', activityResp.status);
      
      if (activityResp.ok) {
        activities = await activityResp.json();
        console.log(`Found ${activities.length} activities in database`);
      } else {
        const errorText = await activityResp.text();
        console.log('Activity table not found or empty:', errorText);
      }
    } catch (error) {
      console.log('Error fetching user activity:', error.message);
    }

    // Get user properties data
    let properties = [];
    try {
      console.log('Attempting to fetch user properties from Supabase...');
      const propertiesQuery = new URLSearchParams({ 
        select: '*', 
        order: 'created_at.desc', 
        limit: '10000' 
      });
      
      const propertiesResp = await fetch(`${url}/rest/v1/user_properties?${propertiesQuery.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      console.log('Properties response status:', propertiesResp.status);
      
      if (propertiesResp.ok) {
        properties = await propertiesResp.json();
        console.log(`Found ${properties.length} properties in database`);
      } else {
        const errorText = await propertiesResp.text();
        console.log('Properties table not found or empty:', errorText);
      }
    } catch (error) {
      console.log('Error fetching user properties:', error.message);
    }

    // Process and aggregate data
    const userAnalytics = users.map(user => {
      const userActivities = activities.filter(activity => activity.user_id === user.id);
      const userProperties = properties.filter(prop => prop.user_id === user.id);
      
      // Calculate engagement metrics
      const totalActions = userActivities.length;
      const lastActivity = userActivities.length > 0 ? userActivities[0].timestamp : null;
      const firstActivity = userActivities.length > 0 ? userActivities[userActivities.length - 1].timestamp : null;
      
      // Feature usage breakdown
      const featureUsage = {};
      userActivities.forEach(activity => {
        if (activity.action) {
          featureUsage[activity.action] = (featureUsage[activity.action] || 0) + 1;
        }
      });

      // Add property-related features
      if (userProperties.length > 0) {
        featureUsage['properties_saved'] = userProperties.length;
        featureUsage['ai_prompt_builder'] = (featureUsage['ai_prompt_builder'] || 0) + userProperties.length;
      }

      // Location data (from most recent activity)
      const recentActivity = userActivities.find(activity => activity.location);
      const location = recentActivity?.location || {};

      // Handle different field name variations for Google vs email users
      const firstName = user.firstName || user.first_name || 'Unknown';
      const lastName = user.lastName || user.last_name || 'Unknown';
      const email = user.email || 'No Email';
      const createdAt = user.createdAt || user.created_at || new Date().toISOString();
      const provider = user.provider || 'email';

      return {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        created_at: createdAt,
        provider: provider,
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
    console.error('Error getting user analytics:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
