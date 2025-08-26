import { getSupabaseConfig, supabaseHeaders } from './_supabase.js';
import { hashPasswordScrypt } from './_auth.js';
import { sendEmailOrQueue } from './_email.js';

export async function handler(event, context) {
  try {
    console.log('save-user function called');
    console.log('Event body:', event.body);
    
    const { userData, referralCode } = JSON.parse(event.body || '{}');
    console.log('Parsed userData:', userData);
    
    if (!userData || !userData.email) {
      console.log('Missing required data:', userData);
      return { statusCode: 400, body: 'Missing required data: userData with email' };
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    const table = 'users';
    
    console.log('Using Supabase config:', { url, table });

    // Prepare minimal user data for initial insert
    const dbUserData = {
      id: userData.id,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      email: userData.email,
      provider: userData.provider || 'email',
      created_at: userData.createdAt || userData.created_at || new Date().toISOString()
    };

    console.log('Prepared user data for database:', dbUserData);

    // Check if user already exists
    const checkResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, { headers: supabaseHeaders(serviceRoleKey) });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists, updating...');
        
        // Update existing user
        const updateResponse = await fetch(`${url}/rest/v1/${table}?email=eq.${encodeURIComponent(dbUserData.email)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            first_name: dbUserData.first_name,
            last_name: dbUserData.last_name,
            provider: dbUserData.provider,
            updated_at: new Date().toISOString()
          })
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Failed to update user:', errorText);
          return { statusCode: 502, body: `Failed to update user: ${errorText}` };
        }

        console.log('User updated successfully');
        return { statusCode: 200, body: JSON.stringify({ success: true, action: 'updated' }) };
      }
    }

    // Insert new user
    const insertResponse = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(dbUserData)
    });

    console.log('Insert response status:', insertResponse.status);

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Failed to insert user:', insertResponse.status, errorText);
      return { statusCode: 502, body: JSON.stringify({ error: 'Insert failed', status: insertResponse.status, details: errorText }) };
    }

    console.log('User saved successfully to database');

    // Handle referral completion if referralCode provided
    if (referralCode) {
      try {
        const code = String(referralCode).trim();
        if (code) {
          const findRef = await fetch(`${url}/rest/v1/referrals?referral_code=eq.${encodeURIComponent(code)}&select=*`, { headers: supabaseHeaders(serviceRoleKey) });
          if (findRef.ok) {
            const rows = await findRef.json();
            if (Array.isArray(rows) && rows.length > 0) {
              const referral = rows[0];
              if (referral.status === 'pending') {
                // Complete referral
                const completeResp = await fetch(`${url}/rest/v1/referrals?id=eq.${encodeURIComponent(referral.id)}`, {
                  method: 'PATCH',
                  headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
                  body: JSON.stringify({ referee_user_id: dbUserData.id, status: 'completed', completed_at: new Date().toISOString() })
                });
                if (completeResp.ok) {
                  const [completed] = await completeResp.json();
                  // Reward referrer with fixed credits
                  const REWARD = parseInt(process.env.REFERRER_REWARD || '10', 10);
                  try {
                    const refUserResp = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(completed.referrer_user_id)}&select=id,email,first_name,last_name,credits`, { headers: supabaseHeaders(serviceRoleKey) });
                    if (refUserResp.ok) {
                      const list = await refUserResp.json();
                      const refUser = Array.isArray(list) && list.length > 0 ? list[0] : null;
                      if (refUser) {
                        const newCredits = (refUser.credits || 0) + REWARD;
                        await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(refUser.id)}`, {
                          method: 'PATCH',
                          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                          body: JSON.stringify({ credits: newCredits, updated_at: new Date().toISOString() })
                        });

                        // Queue/send emails
                        const referrerName = [refUser.first_name || '', refUser.last_name || ''].filter(Boolean).join(' ') || null;
                        const refereeName = [dbUserData.first_name || '', dbUserData.last_name || ''].filter(Boolean).join(' ') || null;

                        // Email 1: To referrer on signup
                        await sendEmailOrQueue({
                          to: refUser.email,
                          name: referrerName,
                          subject: 'Success! Someone new has joined with your link',
                          body: `Great news! A new user (${dbUserData.email}) has signed up using your referral link for "${completed.referee_reward_description}". You'll receive your reward as soon as they claim theirs.`,
                          meta: { type: 'referral_referrer_signup', referral_id: completed.id }
                        });

                        // Email 2: To referee after signup
                        await sendEmailOrQueue({
                          to: dbUserData.email,
                          name: refereeName,
                          subject: 'Welcome! Your reward is ready',
                          body: `Welcome aboard! As promised, your reward for signing up (${completed.referee_reward_description}) has been applied to your account.`,
                          meta: { type: 'referral_referee_welcome', referral_id: completed.id }
                        });

                        // Email 3: To referrer when reward granted
                        await sendEmailOrQueue({
                          to: refUser.email,
                          name: referrerName,
                          subject: "You've earned a referral reward!",
                          body: `Thank you for spreading the word! Because ${dbUserData.email} joined and claimed their reward, we've added ${REWARD} account credits to your account.`,
                          meta: { type: 'referral_referrer_reward', referral_id: completed.id, reward: REWARD }
                        });
                      }
                    }
                  } catch (e) {
                    console.log('Referral reward/email error:', e.message);
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.log('Referral handling error:', e.message);
      }
    }
    // If password provided, set it and update last_login
    if (userData.password) {
      try {
        const patch = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(dbUserData.id)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceRoleKey), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ password: hashPasswordScrypt(userData.password), last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
        });
        if (!patch.ok) {
          console.log('Password patch failed with status:', patch.status);
        }
      } catch (e) {
        console.log('Password patch error:', e.message);
      }
    }
    console.log('Final user data saved:', dbUserData);
    return { statusCode: 200, body: JSON.stringify({ success: true, action: 'created' }) };

  } catch (error) {
    console.error('Error saving user:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: error.message }) };
  }
}
