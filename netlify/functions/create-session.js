import { createJWT, makeSessionCookie } from './_auth.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { userId, email } = JSON.parse(event.body || '{}');
    if (!userId || !email) return { statusCode: 400, body: 'Missing userId or email' };
    const token = createJWT({ sub: userId, email });
    const cookie = makeSessionCookie(token);
    return { statusCode: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


