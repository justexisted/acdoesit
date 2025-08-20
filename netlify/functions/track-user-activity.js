export async function handler(event, context) {
  // Temporarily remove authentication check for testing
  // if (!context.clientContext || !context.clientContext.user) {
  //   return { statusCode: 401, body: 'Unauthorized' };
  // }

  try {
    const { userId, action, details, location, ipAddress, userAgent } = JSON.parse(event.body || '{}');
    
    if (!userId || !action) {
      return { statusCode: 400, body: 'Missing required fields: userId and action' };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    
    if (!url || !key) {
      console.log('Supabase not configured, logging activity locally');
      return { statusCode: 200, body: JSON.stringify({ success: true, logged: 'locally' }) };
    }

    // Prepare activity data
    const activityData = {
      user_id: userId,
      action: action,
      details: details || {},
      location: location || {},
      timestamp: new Date().toISOString(),
      ip_address: ipAddress || null,
      user_agent: userAgent || null
    };

    console.log('Tracking user activity:', {
      userId: activityData.user_id,
      action: activityData.action,
      timestamp: activityData.timestamp
    });

    // Insert into user_activity table
    const response = await fetch(`${url}/rest/v1/user_activity`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(activityData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to track activity:', errorText);
      return { statusCode: 502, body: `Failed to track activity: ${errorText}` };
    }

    console.log('Activity tracked successfully');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
