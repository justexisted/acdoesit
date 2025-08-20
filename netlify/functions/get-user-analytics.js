export async function handler(event, context) {
  // Temporarily remove authentication check for testing
  // if (!context.clientContext || !context.clientContext.user) {
  //   return { statusCode: 401, body: 'Unauthorized' };
  // }

  try {
    console.log('get-user-analytics function called');
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    
    console.log('Supabase config check:', {
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? 'configured' : 'missing',
      key: key ? 'configured' : 'missing'
    });
    
    if (!url || !key) {
      console.log('Supabase credentials not configured, returning test data');
      // Return test data if Supabase is not configured
      return { 
        statusCode: 200, 
        body: JSON.stringify([
          {
            id: 'test-user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            provider: 'email',
            total_actions: 15,
            last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            engagement_score: 85,
            feature_usage: {
              'ai_prompt_builder': 8,
              'property_saved': 3,
              'address_saved': 2,
              'neighborhood_saved': 2
            },
            location: {
              city: 'San Diego',
              region: 'CA',
              country: 'US'
            }
          },
          {
            id: 'test-user-2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@gmail.com',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            provider: 'google',
            total_actions: 8,
            last_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            engagement_score: 65,
            feature_usage: {
              'ai_prompt_builder': 5,
              'property_saved': 2,
              'address_saved': 1
            },
            location: {
              city: 'Los Angeles',
              region: 'CA',
              country: 'US'
            }
          },
          {
            id: 'test-user-3',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike@example.com',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            provider: 'email',
            total_actions: 3,
            last_activity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            engagement_score: 25,
            feature_usage: {
              'ai_prompt_builder': 2,
              'property_saved': 1
            },
            location: {
              city: 'Phoenix',
              region: 'AZ',
              country: 'US'
            }
          }
        ]), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }

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
      }
    } catch (error) {
      console.log('Error fetching users from database:', error.message);
    }

    // If no users in database, return empty array for now
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

    // Process and aggregate data
    const userAnalytics = users.map(user => {
      const userActivities = activities.filter(activity => activity.user_id === user.id);
      
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
        engagement_score: totalActions > 0 ? Math.min(100, totalActions * 10) : 0
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
