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

    const bodyUserId = (() => { try { return JSON.parse(event.body || '{}').userId || null; } catch { return null; } })();
    const targetUserId = userIdFromCookie || bodyUserId;
    if (!targetUserId) {
      return { statusCode: 200, body: JSON.stringify({ user: null }), headers: { 'Content-Type': 'application/json' } };
    }

    // Fetch exactly this user
    const response = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(targetUserId)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
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

    // Consider session valid only if last_login is set (we clear it on sign-out)
    if (user && user.last_login) {
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
