-- Update existing database schema to match the new requirements
-- Run this in your Supabase SQL Editor

-- 1. Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
-- 6. Create user_prompts table if missing
CREATE TABLE IF NOT EXISTS user_prompts (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  module TEXT,
  template TEXT,
  prompt TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_id ON user_prompts(user_id);
ALTER TABLE user_prompts ADD COLUMN IF NOT EXISTS property_id INTEGER REFERENCES user_properties(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_user_prompts_property_id ON user_prompts(property_id);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- 3. Update existing users to have last_login value (set to created_at for now)
UPDATE users 
SET last_login = created_at 
WHERE last_login IS NULL;

-- 4. Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 5. Check if there are any users in the table
SELECT COUNT(*) as total_users FROM users;

-- 6. Show sample user data (without passwords)
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  provider, 
  last_login, 
  created_at 
FROM users 
LIMIT 5;
