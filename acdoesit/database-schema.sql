-- Database Schema for User Analytics and Tracking
-- Run this in your Supabase SQL editor

-- Users table (stores user registration data)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity table (tracks all user actions)
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  location JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- User Saved Data table (stores saved addresses and neighborhoods)
CREATE TABLE IF NOT EXISTS user_saved_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('address', 'neighborhood')),
  value TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_saved_data_user_id ON user_saved_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_data_type ON user_saved_data(type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_data ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (for Netlify functions)
CREATE POLICY "Service role can access all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all user activity" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all user saved data" ON user_saved_data
  FOR ALL USING (auth.role() = 'service_role');

-- Create a view for user analytics (optional, for easier querying)
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.created_at,
  u.provider,
  COUNT(ua.id) as total_actions,
  MAX(ua.timestamp) as last_activity,
  MIN(ua.timestamp) as first_activity,
  CASE 
    WHEN COUNT(ua.id) >= 10 THEN 100
    WHEN COUNT(ua.id) >= 5 THEN 70
    WHEN COUNT(ua.id) >= 2 THEN 40
    WHEN COUNT(ua.id) >= 1 THEN 20
    ELSE 0
  END as engagement_score
FROM users u
LEFT JOIN user_activity ua ON u.id = ua.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at, u.provider;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_data_updated_at 
  BEFORE UPDATE ON user_saved_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO users (id, first_name, last_name, email, provider) VALUES
--   ('user1', 'John', 'Doe', 'john@example.com', 'email'),
--   ('user2', 'Jane', 'Smith', 'jane@example.com', 'google');

-- INSERT INTO user_activity (user_id, action, details, location) VALUES
--   ('user1', 'page_view', '{"page": "ai_prompt_builder"}', '{"city": "San Diego", "region": "CA", "country": "US"}'),
--   ('user1', 'module_switch', '{"module": "listing"}', '{"city": "San Diego", "region": "CA", "country": "US"}'),
--   ('user2', 'page_view', '{"page": "ai_prompt_builder"}', '{"city": "Los Angeles", "region": "CA", "country": "US"}');

-- INSERT INTO user_saved_data (user_id, type, value, label) VALUES
--   ('user1', 'address', '123 Main St, San Diego, CA', 'Home Address'),
--   ('user1', 'neighborhood', 'North Park', 'Favorite Area'),
--   ('user2', 'address', '456 Oak Ave, Los Angeles, CA', 'Work Address');
