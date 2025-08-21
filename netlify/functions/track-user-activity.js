import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    console.log('track-user-activity function called');
    console.log('Event body:', event.body);
    
    const { user_id, action, details, location } = JSON.parse(event.body || '{}');
    
    console.log('Parsed data:', { user_id, action, details, location });
    
    if (!user_id || !action) {
      console.log('Missing required fields:', { user_id, action });
      return { statusCode: 400, body: 'Missing required fields: user_id and action' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();

    // Prepare activity data - only include fields that exist in the database schema
    const activityData = {
      user_id: user_id,
      action: action,
      details: details || {},
      location: location || {},
      timestamp: new Date().toISOString()
    };

    console.log('Tracking user activity:', {
      userId: activityData.user_id,
      action: activityData.action,
      timestamp: activityData.timestamp
    });

    // Insert into user_activity table
    const response = await fetch(`${url}/rest/v1/user_activity`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(activityData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to track activity:', errorText);
      
      // If table doesn't exist (404) or other error, return success to prevent site crashes
      // The activity will be lost, but the site will continue to work
      if (response.status === 404) {
        console.log('user_activity table not found - activity tracking disabled');
        return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Table not found, activity not tracked' }) };
      }
      
      // For other errors, still return success to prevent site crashes
      console.log('Activity tracking failed, but returning success to prevent site crash');
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Activity not tracked due to error' }) };
    }

    console.log('Activity tracked successfully');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
