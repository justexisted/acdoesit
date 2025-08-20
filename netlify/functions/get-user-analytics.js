export async function handler(event, context) {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    // Get users from the users table
    const usersQuery = new URLSearchParams({ 
      select: '*', 
      order: 'created_at.desc', 
      limit: '1000' 
    });
    
    const usersResp = await fetch(`${url}/rest/v1/users?${usersQuery.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    
    if (!usersResp.ok) return { statusCode: 502, body: 'Failed to fetch users' };
    const users = await usersResp.json();

    // Get user activity data
    const activityQuery = new URLSearchParams({ 
      select: '*', 
      order: 'timestamp.desc', 
      limit: '10000' 
    });
    
    const activityResp = await fetch(`${url}/rest/v1/user_activity?${activityQuery.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    
    if (!activityResp.ok) return { statusCode: 502, body: 'Failed to fetch activity' };
    const activities = await activityResp.json();

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
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        created_at: user.createdAt,
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
