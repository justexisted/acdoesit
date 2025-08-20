export async function handler(event, context) {
  try {
    console.log('save-user-property function called');
    console.log('Event body:', event.body);
    
    const { userId, propertyData } = JSON.parse(event.body || '{}');
    
    console.log('Parsed data:', { userId, propertyData });
    
    if (!userId || !propertyData) {
      console.log('Missing required data:', { userId, propertyData });
      return { statusCode: 400, body: 'Missing required data: userId and propertyData' };
    }

    // Your Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzEzNzUsImV4cCI6MjA3MTEwNzM3NX0.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    const table = 'user_properties';
    
    console.log('Using Supabase config:', {
      url: url,
      key: key ? 'configured' : 'missing',
      table: table
    });

    // Prepare property data for database
    const dbPropertyData = {
      user_id: userId,
      property_name: propertyData.propertyName || propertyData.Property_Address || 'Unnamed Property',
      address: propertyData.address || propertyData.Property_Address || '',
      neighborhood: propertyData.neighborhood || propertyData.Neighborhood || '',
      property_type: propertyData.propertyType || propertyData.Property_Type || '',
      target_audience: propertyData.targetAudience || propertyData.Target_Audience || '',
      unique_features: propertyData.uniqueFeatures || propertyData.Unique_Features || '',
      form_data: propertyData.formData || propertyData || {},
      created_at: new Date().toISOString()
    };

    console.log('Prepared property data for database:', dbPropertyData);

    // Insert new property
    const resp = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(dbPropertyData)
    });

    console.log('Supabase response status:', resp.status);
    console.log('Supabase response headers:', Object.fromEntries(resp.headers.entries()));

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Failed to save property:', errorText);
      return { statusCode: 502, body: `Failed to save property: ${errorText}` };
    }

    console.log('Property saved successfully to database');
    
    // Also track this as user activity
    try {
      await fetch('/.netlify/functions/track-user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          action: 'property_saved',
          details: {
            property_name: dbPropertyData.property_name,
            address: dbPropertyData.address,
            neighborhood: dbPropertyData.neighborhood
          }
        })
      });
    } catch (activityError) {
      console.log('Failed to track activity, but property was saved:', activityError);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error saving property:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
}
