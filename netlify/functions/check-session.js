import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { readSessionCookie, verifyJWT } from './_auth.js';

export async function handler(event, context) {
  try {
    console.log('check-session function called');
    const { url, serviceRoleKey } = getSupabaseConfig();

    // Prefer cookie-based session
    const sessionToken = readSessionCookie(event);
    let userIdFromCookie = null;
    if (sessionToken) {
      const payload = verifyJWT(sessionToken);
      userIdFromCookie = payload && payload.sub ? payload.sub : null;
    }

    const parsedBody = (() => { try { return JSON.parse(event.body || '{}'); } catch { return {}; } })();
    const bodyUserId = parsedBody.userId || null;
    const bodyEmail = parsedBody.email || null;
    const targetUserId = userIdFromCookie || bodyUserId;

    let response;
    if (targetUserId) {
      // Fetch exactly this user by id
      response = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(targetUserId)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    } else if (bodyEmail) {
      // Fallback: fetch by email when no cookie/id
      response = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(bodyEmail)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    } else {
      return { statusCode: 200, body: JSON.stringify({ user: null }), headers: { 'Content-Type': 'application/json' } };
    }
    if (!response.ok) {
      console.log('User lookup failed with status', response.status);
      return {
        statusCode: 200,
        body: JSON.stringify({ user: null }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const users = await response.json();
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

    // Consider session valid if we have a verified JWT cookie and the user exists
    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: null }),
      headers: { 'Content-Type': 'application/json' }
    };
    
  } catch (error) {
    console.error('Error checking session:', error);
    return {
      statusCode: 200,
      body: JSON.stringify({ user: null }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
