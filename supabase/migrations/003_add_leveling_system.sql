-- ============================================
-- Migration: Add Leveling System with XP, Badges, and Word Contributions
-- ============================================

-- ============================================
-- TABLE: user_stats (Extended user statistics)
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  experience_points INTEGER DEFAULT 0,
  words_contributed_today INTEGER DEFAULT 0,
  last_word_contribution_date DATE,
  total_words_contributed INTEGER DEFAULT 0,
  total_training_sessions INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT experience_points_positive CHECK (experience_points >= 0)
);

-- Index for performance
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- ============================================
-- TABLE: badges
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji ou URL d'icône
  unlock_level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unlock_level_positive CHECK (unlock_level > 0)
);

-- Index for level-based queries
CREATE INDEX idx_badges_unlock_level ON badges(unlock_level);

-- ============================================
-- TABLE: user_badges (Many-to-many relationship)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(badge_id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Index for user badge queries
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- ============================================
-- TABLE: word_contributions (User-contributed words)
-- ============================================
CREATE TABLE IF NOT EXISTS word_contributions (
  contribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  syllables JSONB NOT NULL, -- Array of syllable objects
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT word_not_empty CHECK (char_length(word) > 0)
);

-- Indexes for queries
CREATE INDEX idx_word_contributions_user_id ON word_contributions(user_id);
CREATE INDEX idx_word_contributions_status ON word_contributions(status);
CREATE INDEX idx_word_contributions_created_at ON word_contributions(created_at DESC);

-- ============================================
-- FUNCTION: Auto-create user_stats on user creation
-- ============================================
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user_stats
CREATE TRIGGER on_user_created_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- ============================================
-- FUNCTION: Calculate level from XP
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- Level 1: 0-99 XP
  -- Level 2: 100-399 XP
  -- Level 3: 400-899 XP
  -- Level 4: 900-1599 XP
  -- etc.
  RETURN FLOOR(SQRT(xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCTION: Add XP and update level
-- ============================================
CREATE OR REPLACE FUNCTION add_experience(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT DEFAULT 'unknown'
)
RETURNS TABLE(
  new_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN,
  unlocked_badges JSONB
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
  v_unlocked_badges JSONB := '[]'::JSONB;
  v_badge RECORD;
BEGIN
  -- Get current XP and level
  SELECT experience_points, level INTO v_old_xp, v_old_level
  FROM user_stats us
  JOIN users u ON u.user_id = us.user_id
  WHERE us.user_id = p_user_id;

  -- Add XP
  v_new_xp := v_old_xp + p_xp_amount;
  
  -- Calculate new level
  v_new_level := calculate_level(v_new_xp);
  
  -- Check if leveled up
  IF v_new_level > v_old_level THEN
    v_level_up := true;
    
    -- Unlock badges for new level
    FOR v_badge IN 
      SELECT b.badge_id, b.name, b.description, b.icon
      FROM badges b
      WHERE b.unlock_level <= v_new_level
      AND NOT EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = p_user_id AND ub.badge_id = b.badge_id
      )
    LOOP
      -- Insert new badge
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.badge_id);
      
      -- Add to unlocked badges array
      v_unlocked_badges := v_unlocked_badges || jsonb_build_object(
        'badge_id', v_badge.badge_id,
        'name', v_badge.name,
        'description', v_badge.description,
        'icon', v_badge.icon
      );
    END LOOP;
  END IF;

  -- Update user_stats
  UPDATE user_stats
  SET experience_points = v_new_xp,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update users table level
  UPDATE users
  SET level = v_new_level,
      total_points = v_new_xp,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up, v_unlocked_badges;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Check daily word contribution limit
-- ============================================
CREATE OR REPLACE FUNCTION can_contribute_word(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_contributions_today INTEGER;
  v_last_contribution_date DATE;
  v_max_daily_contributions INTEGER := 5; -- Cap at 5 words per day
BEGIN
  SELECT words_contributed_today, last_word_contribution_date
  INTO v_contributions_today, v_last_contribution_date
  FROM user_stats
  WHERE user_id = p_user_id;

  -- Reset counter if it's a new day
  IF v_last_contribution_date IS NULL OR v_last_contribution_date < CURRENT_DATE THEN
    UPDATE user_stats
    SET words_contributed_today = 0,
        last_word_contribution_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  -- Check if under limit
  RETURN v_contributions_today < v_max_daily_contributions;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Trigger to update user_stats timestamp
-- ============================================
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_contributions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: user_stats
-- ============================================

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON user_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_stats.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_stats.user_id
      AND users.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_stats.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: badges
-- ============================================

-- Everyone can view badges
CREATE POLICY "Anyone can view badges"
  ON badges
  FOR SELECT
  USING (true);

-- ============================================
-- RLS POLICIES: user_badges
-- ============================================

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON user_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = user_badges.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can view other users' badges (public)
CREATE POLICY "Anyone can view user badges"
  ON user_badges
  FOR SELECT
  USING (true);

-- ============================================
-- RLS POLICIES: word_contributions
-- ============================================

-- Users can view their own contributions
CREATE POLICY "Users can view own contributions"
  ON word_contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = word_contributions.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can insert their own contributions
CREATE POLICY "Users can insert own contributions"
  ON word_contributions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = word_contributions.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Everyone can view approved contributions
CREATE POLICY "Anyone can view approved contributions"
  ON word_contributions
  FOR SELECT
  USING (status = 'approved');

-- ============================================
-- SEED DATA: Initial badges
-- ============================================
INSERT INTO badges (name, description, icon, unlock_level) VALUES
  ('Débutant', 'Bienvenue dans l''aventure LFPC !', '🌱', 1),
  ('Apprenti', 'Vous progressez bien !', '📚', 2),
  ('Pratiquant', 'La pratique rend parfait !', '💪', 3),
  ('Expert', 'Vous maîtrisez les bases !', '⭐', 5),
  ('Maître', 'Niveau impressionnant !', '🏆', 10),
  ('Légende', 'Vous êtes une légende LFPC !', '👑', 20),
  ('Contributeur', 'Premier mot ajouté !', '✍️', 1),
  ('Érudit', '10 mots contribués !', '📖', 1),
  ('Encyclopédie', '50 mots contribués !', '📚', 1),
  ('Assidu', '7 jours de suite !', '🔥', 1),
  ('Marathonien', '30 jours de suite !', '🏃', 1),
  ('Champion', '100 jours de suite !', '🥇', 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE user_stats IS 'Extended user statistics for XP and leveling system';
COMMENT ON TABLE badges IS 'Unlockable badges for achievements';
COMMENT ON TABLE user_badges IS 'Badges unlocked by users';
COMMENT ON TABLE word_contributions IS 'Words contributed by users for the community';

COMMENT ON COLUMN user_stats.experience_points IS 'Total XP earned by user';
COMMENT ON COLUMN user_stats.words_contributed_today IS 'Number of words contributed today (reset daily)';
COMMENT ON COLUMN user_stats.last_word_contribution_date IS 'Last date a word was contributed';
COMMENT ON FUNCTION add_experience IS 'Add XP to user and handle level ups and badge unlocks';
COMMENT ON FUNCTION can_contribute_word IS 'Check if user can contribute a word today (max 5/day)';
