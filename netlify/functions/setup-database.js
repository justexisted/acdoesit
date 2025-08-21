export async function handler(event, context) {
  try {
    console.log('setup-database function called');
    
    // Your Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    console.log('Setting up database tables...');
    
    // Test basic connection first
    const testResponse = await fetch(`${url}/rest/v1/`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    
    if (!testResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Cannot connect to Supabase',
          status: testResponse.status,
          statusText: testResponse.statusText
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    // Check what tables exist
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
      message: 'Database connection successful. Check table status above.',
      nextSteps: []
    };
    
    // Provide next steps based on what's missing
    if (!tableStatus.users.exists) {
      results.nextSteps.push('Create users table using the SQL script in setup-database.sql');
    }
    if (!tableStatus.user_properties.exists) {
      results.nextSteps.push('Create user_properties table using the SQL script in setup-database.sql');
    }
    if (!tableStatus.user_activity.exists) {
      results.nextSteps.push('Create user_activity table using the SQL script in setup-database.sql');
    }
    
    if (results.nextSteps.length === 0) {
      results.message = 'All required tables exist! Your database is properly configured.';
    }
    
    console.log('Database setup check results:', results);
    
    return {
      statusCode: 200,
      body: JSON.stringify(results),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error setting up database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
