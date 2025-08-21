export async function handler(event, context) {
  try {
    // Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    // Verify basic connection
    const connectionResponse = await fetch(`${url}/rest/v1/`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    
    if (!connectionResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Cannot connect to Supabase',
          status: connectionResponse.status,
          statusText: connectionResponse.statusText
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    // Verify required tables exist
    const tables = ['users', 'user_properties', 'user_activity'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        
        tableStatus[table] = {
          exists: response.ok,
          status: response.status,
          statusText: response.statusText
        };
      } catch (error) {
        tableStatus[table] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    const results = {
      connection: 'success',
      tables: tableStatus,
      message: 'Database connection verified. Table status displayed above.',
      nextSteps: []
    };
    
    // Identify missing tables
    if (!tableStatus.users.exists) {
      results.nextSteps.push('Create users table using setup-database.sql');
    }
    if (!tableStatus.user_properties.exists) {
      results.nextSteps.push('Create user_properties table using setup-database.sql');
    }
    if (!tableStatus.user_activity.exists) {
      results.nextSteps.push('Create user_activity table using setup-database.sql');
    }
    
    if (results.nextSteps.length === 0) {
      results.message = 'All required tables exist. Database is properly configured.';
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(results),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Database verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
