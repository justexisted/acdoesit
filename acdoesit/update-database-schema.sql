-- Update existing database schema to match the new requirements
-- Run this in your Supabase SQL Editor

-- 1. Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
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
