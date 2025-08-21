import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

async function sendEmailResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'no-reply@acdoesit.com';
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Email send failed: ${text}`);
  }
}

function generateToken() {
  return [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function handler(event) {
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return { statusCode: 400, body: 'Missing email' };

    const { url, serviceRoleKey } = getSupabaseConfig();

    // find user
    const userResp = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
    if (!userResp.ok) return { statusCode: 404, body: 'User not found' };
    const users = await userResp.json();
    if (!Array.isArray(users) || users.length === 0) return { statusCode: 200, body: JSON.stringify({ success: true }) };
    const user = users[0];

    // create token (store in users table for simplicity)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const patch = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ reset_token: token, reset_token_expires_at: expiresAt, updated_at: new Date().toISOString() })
    });
    if (!patch.ok) {
      const text = await patch.text();
      return { statusCode: 502, body: `Failed to set reset token: ${text}` };
    }

    const siteUrl = process.env.SITE_URL || 'https://www.acdoesit.com';
    const resetLink = `${siteUrl}/start.html#reset=${token}`;
    await sendEmailResend(email, 'Reset your AC Does It password', `Click to reset your password: <a href="${resetLink}">${resetLink}</a>`);

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}


