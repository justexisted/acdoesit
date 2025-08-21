export async function handler(event, context) {
  try {
    console.log('test-connection function called');
    
    // Your Supabase configuration
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9lIjoiYW5vbiIsImlhdCI6MTc1NTUzMTM3NSwiZXhwIjoyMDcxMTA3Mzc1fQ.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const testResponse = await fetch(`${url}/rest/v1/`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    
    console.log('Basic connection test:', testResponse.status, testResponse.statusText);
    
    // Test if user_activity table exists
    let userActivityTest = null;
    try {
      const userActivityResponse = await fetch(`${url}/rest/v1/user_activity?select=id&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      userActivityTest = {
        status: userActivityResponse.status,
        statusText: userActivityResponse.statusText,
        exists: userActivityResponse.ok
      };
    } catch (error) {
      userActivityTest = { error: error.message };
    }
    
    // Test if users table exists
    let usersTest = null;
    try {
      const usersResponse = await fetch(`${url}/rest/v1/users?select=id&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      usersTest = {
        status: usersResponse.status,
        statusText: usersResponse.statusText,
        exists: usersResponse.ok
      };
    } catch (error) {
      usersTest = { error: error.message };
    }
    
    // Test if user_properties table exists
    let userPropertiesTest = null;
    try {
      const userPropertiesResponse = await fetch(`${url}/rest/v1/user_properties?select=id&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      userPropertiesTest = {
        status: userPropertiesResponse.status,
        statusText: userPropertiesResponse.statusText,
        exists: userPropertiesResponse.ok
      };
    } catch (error) {
      userPropertiesTest = { error: error.message };
    }
    
    const results = {
      basicConnection: {
        status: testResponse.status,
        statusText: testResponse.statusText
      },
      userActivityTable: userActivityTest,
      usersTable: usersTest,
      userPropertiesTable: userPropertiesTest
    };
    
    console.log('Connection test results:', results);
    
    return {
      statusCode: 200,
      body: JSON.stringify(results),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
