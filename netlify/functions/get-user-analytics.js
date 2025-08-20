export async function handler(event, context) {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    // First, try to get users from the users table
    let users = [];
    try {
      const usersQuery = new URLSearchParams({ 
        select: '*', 
        order: 'created_at.desc', 
        limit: '1000' 
      });
      
      const usersResp = await fetch(`${url}/rest/v1/users?${usersQuery.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      if (usersResp.ok) {
        users = await usersResp.json();
      } else {
        console.log('Users table not found or empty, will create from localStorage data');
      }
    } catch (error) {
      console.log('Error fetching users from database:', error.message);
    }

    // If no users in database, create a basic structure from localStorage data
    if (!users || users.length === 0) {
      // Return empty analytics for now - users will be populated as they sign up
      const emptyAnalytics = [];
      
      return { 
        statusCode: 200, 
        body: JSON.stringify(emptyAnalytics), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }

    // Get user activity data
    let activities = [];
    try {
      const activityQuery = new URLSearchParams({ 
        select: '*', 
        order: 'timestamp.desc', 
        limit: '10000' 
      });
      
      const activityResp = await fetch(`${url}/rest/v1/user_activity?${activityQuery.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      if (activityResp.ok) {
        activities = await activityResp.json();
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

      return {
        id: user.id,
        first_name: user.firstName || user.first_name,
        last_name: user.lastName || user.last_name,
        email: user.email,
        created_at: user.createdAt || user.created_at,
        provider: user.provider || 'email',
        total_actions: totalActions,
        last_activity: lastActivity,
        first_activity: firstActivity,
        feature_usage: featureUsage,
        location: location,
        engagement_score: totalActions > 0 ? Math.min(100, totalActions * 10) : 0
      };
    });

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
