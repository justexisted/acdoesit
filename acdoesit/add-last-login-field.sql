-- Add missing last_login field to existing users table
-- Run this in your Supabase SQL Editor

-- Add the last_login column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Update existing users to have a last_login value (set to created_at for now)
UPDATE users 
SET last_login = created_at 
WHERE last_login IS NULL;

-- Verify the change
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'last_login';
