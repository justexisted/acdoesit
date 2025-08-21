// Lightweight auth utilities: scrypt password hashing and HS256 JWT
import crypto from 'crypto';

// Base64url helpers
function base64UrlEncode(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = 4 - (str.length % 4);
  if (pad !== 4) str += '='.repeat(pad);
  return Buffer.from(str, 'base64');
}

// Password hashing with scrypt (avoids external deps). Format: scrypt:N:r:p:salt:hash
export function hashPasswordScrypt(password) {
  const N = 16384, r = 8, p = 1, keyLen = 64;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, keyLen, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${base64UrlEncode(salt)}:${base64UrlEncode(hash)}`;
}

export function verifyPasswordScrypt(stored, password) {
  try {
    if (!stored || !stored.startsWith('scrypt:')) return false;
    const parts = stored.split(':');
    const N = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = base64UrlDecode(parts[4]);
    const expected = base64UrlDecode(parts[5]);
    const hash = crypto.scryptSync(password, salt, expected.length, { N, r, p });
    return crypto.timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

// Minimal HS256 JWT
export function createJWT(payload, expiresInSeconds = 60 * 60 * 24) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET');
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSeconds, ...payload };
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  const encSig = base64UrlEncode(sig);
  return `${data}.${encSig}`;
}

export function verifyJWT(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET');
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  const payload = JSON.parse(base64UrlDecode(p).toString('utf8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  return payload;
}

export function makeSessionCookie(token, maxAgeSeconds = 60 * 60 * 24) {
  const secure = 'Secure';
  const httpOnly = 'HttpOnly';
  const sameSite = 'SameSite=Lax';
  const path = 'Path=/';
  return `session=${token}; Max-Age=${maxAgeSeconds}; ${path}; ${httpOnly}; ${sameSite}; ${secure}`;
}

export function clearSessionCookie() {
  return 'session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure';
}

export function readSessionCookie(event) {
  const cookie = event.headers && (event.headers.cookie || event.headers.Cookie || '');
  if (!cookie) return null;
  const match = cookie.match(/(?:^|; )session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}


