export async function handler(event, context) {
  try {
    console.log('Testing Supabase connection...');
    
    // Your Supabase credentials
    const url = "https://vkaejxrjvxxfkwidakxq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWVqeHJqdnh4Zmt3aWRha3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzEzNzUsImV4cCI6MjA3MTEwNzM3NX0.AWbLw3KEIZijsNbhCV2QO5IF8Ie5P90PfRohwXZjjBI";
    
    // Test 1: Check if we can connect to Supabase
    const testResponse = await fetch(`${url}/rest/v1/`, {
      headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}` 
      }
    });
    
    console.log('Supabase connection test:', {
      status: testResponse.status,
      ok: testResponse.ok,
      headers: Object.fromEntries(testResponse.headers.entries())
    });
    
    // Test 2: Try to access the leads table
    const leadsResponse = await fetch(`${url}/rest/v1/leads?select=count`, {
      headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}` 
      }
    });
    
    console.log('Leads table test:', {
      status: leadsResponse.status,
      ok: leadsResponse.ok
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Supabase connection test completed',
        supabase_connection: testResponse.ok ? 'SUCCESS' : 'FAILED',
        leads_table_access: leadsResponse.ok ? 'SUCCESS' : 'FAILED',
        timestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}
