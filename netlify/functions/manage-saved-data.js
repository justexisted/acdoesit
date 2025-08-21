export async function handler(event, context) {
  try {
    console.log('manage-saved-data function called');
    console.log('Event body:', event.body);
    const { action, userId, data } = JSON.parse(event.body || '{}');
    
    console.log('Parsed request:', { action, userId, data });
    
    if (!action || !userId) {
      console.log('Missing required fields:', { action, userId });
      return { statusCode: 400, body: 'Missing required fields' };
    }

    // Your Supabase configuration (same as other functions)
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    if (!url || !key) return { statusCode: 500, body: 'Server not configured' };

    if (action === 'get') {
      // Get saved data for user from user_properties table
      const query = new URLSearchParams({ 
        select: 'address,neighborhood', 
        user_id: `eq.${userId}`,
        order: 'created_at.desc'
      });
      
      const resp = await fetch(`${url}/rest/v1/user_properties?${query.toString()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      
      if (!resp.ok) {
        console.log('Failed to fetch saved data:', resp.status, resp.statusText);
        // Return empty data if there's an error
        return { 
          statusCode: 200, 
          body: JSON.stringify({ addresses: [], neighborhoods: [] }), 
          headers: { 'Content-Type': 'application/json' } 
        };
      }
      
      const savedData = await resp.json();
      console.log('Fetched saved data:', savedData);
      
      // Extract unique addresses and neighborhoods from saved properties
      const addresses = [...new Set(savedData
        .filter(item => item.address && item.address.trim())
        .map(item => ({ value: item.address, label: item.address })))];
      
      const neighborhoods = [...new Set(savedData
        .filter(item => item.neighborhood && item.neighborhood.trim())
        .map(item => ({ value: item.neighborhood, label: item.neighborhood })))];
      
      return { 
        statusCode: 200, 
        body: JSON.stringify({ addresses, neighborhoods }), 
        headers: { 'Content-Type': 'application/json' } 
      };
    }
    
    if (action === 'save') {
      // Since addresses and neighborhoods are saved when properties are saved,
      // we just return success here. The data will be available when properties are loaded.
      console.log('Save action called for:', data);
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Data will be saved with property' }) };
    }
    
    if (action === 'delete') {
      // Delete action not needed since data is managed through properties
      console.log('Delete action called for:', data);
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Delete not implemented' }) };
    }

    return { statusCode: 400, body: 'Invalid action' };
  } catch (error) {
    console.error('Error managing saved data:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
