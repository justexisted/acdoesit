-- Run this in your Supabase SQL Editor to create the proper database structure

-- 1. Create users table for storing user accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_properties table for saving AI prompt builder data
CREATE TABLE IF NOT EXISTS user_properties (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  property_name TEXT,
  address TEXT,
  neighborhood TEXT,
  property_type TEXT,
  target_audience TEXT,
  unique_features TEXT,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_activity table for tracking user actions
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  location JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_properties_user_id ON user_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for anonymous access (since you're using anon key)
CREATE POLICY "Allow anonymous access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to user_properties" ON user_properties
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to user_activity" ON user_activity
  FOR ALL USING (true);

-- 7. Insert a test user to verify everything works
INSERT INTO users (id, first_name, last_name, email, provider) 
VALUES ('test-user-1', 'Test', 'User', 'test@example.com', 'email')
ON CONFLICT (email) DO NOTHING;

-- 8. Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'user_properties', 'user_activity')
ORDER BY table_name, ordinal_position;
