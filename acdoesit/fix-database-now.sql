-- Fix database schema immediately - run this in Supabase SQL Editor

-- 1. Add missing fields if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 3. Update existing users to have last_login value
UPDATE users 
SET last_login = created_at 
WHERE last_login IS NULL;

-- 4. Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 5. Show all users (without passwords)
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  provider, 
  last_login, 
  created_at 
FROM users 
ORDER BY created_at DESC;
