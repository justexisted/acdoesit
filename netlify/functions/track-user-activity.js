export async function handler(event, context) {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { userId, action, details, location } = JSON.parse(event.body || '{}');
    
    if (!userId || !action) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = 'user_activity';
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    const activityData = {
      user_id: userId,
      action: action,
      details: details || {},
      location: location || {},
      timestamp: new Date().toISOString(),
      ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
    };

    const resp = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(activityData)
    });

    if (!resp.ok) {
      console.error('Failed to track activity:', await resp.text());
      return { statusCode: 502, body: 'Failed to track activity' };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
