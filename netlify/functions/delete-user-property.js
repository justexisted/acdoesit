import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function handler(event, context) {
  try {
    const { userId, propertyId } = JSON.parse(event.body || '{}');
    
    if (!userId || !propertyId) {
      return { statusCode: 400, body: 'Missing required data: userId and propertyId' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    
    // Delete property from database
    const response = await fetch(`${url}/rest/v1/user_properties?id=eq.${propertyId}&user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Prefer': 'return=minimal' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete property:', errorText);
      return { statusCode: 502, body: `Failed to delete property: ${errorText}` };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
