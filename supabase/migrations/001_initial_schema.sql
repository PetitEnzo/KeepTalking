-- KeepTalking Database Schema
-- Migration: Initial schema creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_practice_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Index for faster lookups
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- TABLE: lessons
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  lesson_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_number INTEGER NOT NULL UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_lessons_order ON lessons(order_number);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);

-- ============================================
-- TABLE: exercises
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
  exercise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recognition', 'production', 'comprehension', 'multiple_choice')),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- Pour les questions à choix multiples
  images JSONB, -- Array d'URLs d'images
  points INTEGER DEFAULT 10,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT points_positive CHECK (points > 0)
);

-- Indexes for performance
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_order ON exercises(lesson_id, order_number);

-- ============================================
-- TABLE: user_progress
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(exercise_id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id),
  CONSTRAINT score_range CHECK (score >= 0 AND score <= 100)
);

-- Indexes for queries
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_completed ON user_progress(user_id, completed);
CREATE INDEX idx_user_progress_timestamp ON user_progress(timestamp DESC);

-- ============================================
-- FUNCTIONS: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS: Auto-create user profile
-- ============================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text from 1 for 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: users
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Users can view other users' public info (username, level, points)
CREATE POLICY "Users can view public profiles"
  ON users
  FOR SELECT
  USING (true);

-- ============================================
-- RLS POLICIES: lessons
-- ============================================

-- Everyone can view published lessons
CREATE POLICY "Anyone can view published lessons"
  ON lessons
  FOR SELECT
  USING (is_published = true);

-- Only authenticated users can view all lessons (for admin/dev)
CREATE POLICY "Authenticated users can view all lessons"
  ON lessons
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: exercises
-- ============================================

-- Everyone can view exercises from published lessons
CREATE POLICY "Anyone can view exercises from published lessons"
  ON exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.lesson_id = exercises.lesson_id
      AND lessons.is_published = true
    )
  );

-- Authenticated users can view all exercises
CREATE POLICY "Authenticated users can view all exercises"
  ON exercises
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: user_progress
-- ============================================

-- Users can only view their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_progress.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can only insert their own progress
CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_progress.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can only update their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_progress.user_id
      AND users.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_progress.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can only delete their own progress
CREATE POLICY "Users can delete own progress"
  ON user_progress
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_progress.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User profiles with gamification data';
COMMENT ON TABLE lessons IS 'LfPC learning lessons organized by difficulty';
COMMENT ON TABLE exercises IS 'Individual exercises within lessons';
COMMENT ON TABLE user_progress IS 'Tracks user completion and scores for exercises';

COMMENT ON COLUMN users.current_streak IS 'Number of consecutive days of practice';
COMMENT ON COLUMN users.total_points IS 'Cumulative points earned';
COMMENT ON COLUMN users.level IS 'User level based on points';
COMMENT ON COLUMN exercises.images IS 'JSON array of image URLs for visual exercises';
COMMENT ON COLUMN exercises.options IS 'JSON array of options for multiple choice questions';
