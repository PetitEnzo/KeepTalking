-- Add onboarding fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_profile TEXT CHECK (user_profile IN ('deaf', 'hearing', 'family', 'professional')),
ADD COLUMN IF NOT EXISTS user_level TEXT CHECK (user_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS user_goal TEXT CHECK (user_goal IN ('communication', 'professional', 'family', 'curiosity'));

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_users_profile ON users(user_profile);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(user_level);
CREATE INDEX IF NOT EXISTS idx_users_goal ON users(user_goal);
