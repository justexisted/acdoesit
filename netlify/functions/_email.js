import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';

export async function sendEmailOrQueue({ to, name, subject, body, meta = {} }) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // If SMTP creds are present, attempt a direct send via fetch to a gateway (not provided)
  // Keeping it free-first: default to queue in emails_outbox
  try {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const payload = {
      to_email: to,
      to_name: name || null,
      subject,
      body,
      meta,
      status: 'queued',
      created_at: new Date().toISOString()
    };
    const resp = await fetch(`${url}/rest/v1/emails_outbox`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { ok: false, queued: false, error: text };
    }
    return { ok: true, queued: true };
  } catch (e) {
    return { ok: false, queued: false, error: String(e) };
  }
}


