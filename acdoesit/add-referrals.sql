-- Referral system schema additions
-- Run this in your Supabase SQL editor

-- 1) Users: add credits for referrer rewards
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);

-- 2) Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referee_reward_description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- Enable RLS and service role policy similar to other tables
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can access all referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

-- 3) Optional email outbox (queue) for free email handling
CREATE TABLE IF NOT EXISTS emails_outbox (
  id BIGSERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued', -- queued | sent | failed
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_emails_outbox_status ON emails_outbox(status);
CREATE INDEX IF NOT EXISTS idx_emails_outbox_created_at ON emails_outbox(created_at);

ALTER TABLE emails_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can access all emails_outbox" ON emails_outbox
  FOR ALL USING (auth.role() = 'service_role');


