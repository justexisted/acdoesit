export async function handler(event, context) {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { action, userId, data } = JSON.parse(event.body || '{}');
    
    if (!action || !userId) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    if (action === 'get') {
      // Get saved data for user
      const query = new URLSearchParams({ 
        select: '*', 
        user_id: `eq.${userId}`,
        order: 'created_at.desc'
      });
      
      const resp = await fetch(`${url}/rest/v1/user_saved_data?${query.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      if (!resp.ok) {
        // If table doesn't exist, return empty data
        if (resp.status === 404) {
          return { 
            statusCode: 200, 
            body: JSON.stringify({ addresses: [], neighborhoods: [] }), 
            headers: { 'Content-Type': 'application/json' } 
          };
        }
        return { statusCode: 502, body: 'Failed to fetch saved data' };
      }
      
      const savedData = await resp.json();
      
      // Separate addresses and neighborhoods
      const addresses = savedData.filter(item => item.type === 'address');
      const neighborhoods = savedData.filter(item => item.type === 'neighborhood');
      
      return { 
        statusCode: 200, 
        body: JSON.stringify({ addresses, neighborhoods }), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }
    
    if (action === 'save') {
      // Save new data
      if (!data || !data.type || !data.value) {
        return { statusCode: 400, body: 'Missing data to save' };
      }
      
      const saveData = {
        user_id: userId,
        type: data.type, // 'address' or 'neighborhood'
        value: data.value,
        label: data.label || data.value,
        created_at: new Date().toISOString()
      };
      
      const resp = await fetch(`${url}/rest/v1/user_saved_data`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });
      
      if (!resp.ok) {
        console.error('Failed to save data:', await resp.text());
        return { statusCode: 502, body: 'Failed to save data' };
      }
      
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    if (action === 'delete') {
      // Delete saved data
      if (!data || !data.id) {
        return { statusCode: 400, body: 'Missing data ID to delete' };
      }
      
      const resp = await fetch(`${url}/rest/v1/user_saved_data?id=eq.${data.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      
      if (!resp.ok) {
        console.error('Failed to delete data:', await resp.text());
        return { statusCode: 502, body: 'Failed to delete data' };
      }
      
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, body: 'Invalid action' };
  } catch (error) {
    console.error('Error managing saved data:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
