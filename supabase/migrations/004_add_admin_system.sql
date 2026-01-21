-- ============================================
-- Migration: Add Admin System and Update XP Logic
-- ============================================

-- ============================================
-- Add role column to users table
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'apprenant' CHECK (role IN ('apprenant', 'admin'));

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Update user_stats to track XP gains per day
-- ============================================
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS xp_gains_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_xp_gain_date DATE;

-- ============================================
-- Drop old word contribution limit function
-- ============================================
DROP FUNCTION IF EXISTS can_contribute_word(UUID);

-- ============================================
-- FUNCTION: Check daily XP gain limit (max 5 per day)
-- ============================================
CREATE OR REPLACE FUNCTION can_gain_xp_from_contribution(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_xp_gains_today INTEGER;
  v_last_xp_gain_date DATE;
  v_max_daily_xp_gains INTEGER := 5; -- Cap at 5 XP gains per day
BEGIN
  SELECT xp_gains_today, last_xp_gain_date
  INTO v_xp_gains_today, v_last_xp_gain_date
  FROM user_stats
  WHERE user_id = p_user_id;

  -- Reset counter if it's a new day
  IF v_last_xp_gain_date IS NULL OR v_last_xp_gain_date < CURRENT_DATE THEN
    UPDATE user_stats
    SET xp_gains_today = 0,
        last_xp_gain_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  -- Check if under limit
  RETURN v_xp_gains_today < v_max_daily_xp_gains;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Add XP with daily limit check
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
  unlocked_badges JSONB,
  xp_granted BOOLEAN
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
  v_unlocked_badges JSONB := '[]'::JSONB;
  v_badge RECORD;
  v_can_gain_xp BOOLEAN := true;
  v_xp_granted BOOLEAN := false;
BEGIN
  -- Get current XP and level
  SELECT experience_points, level INTO v_old_xp, v_old_level
  FROM user_stats us
  JOIN users u ON u.user_id = us.user_id
  WHERE us.user_id = p_user_id;

  -- Check if source is word_contribution and if user can gain XP
  IF p_source = 'word_contribution' THEN
    v_can_gain_xp := can_gain_xp_from_contribution(p_user_id);
  END IF;

  -- Add XP only if allowed
  IF v_can_gain_xp THEN
    v_new_xp := v_old_xp + p_xp_amount;
    v_xp_granted := true;
    
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
        xp_gains_today = CASE 
          WHEN p_source = 'word_contribution' THEN xp_gains_today + 1
          ELSE xp_gains_today
        END,
        last_xp_gain_date = CASE 
          WHEN p_source = 'word_contribution' THEN CURRENT_DATE
          ELSE last_xp_gain_date
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Update users table level
    UPDATE users
    SET level = v_new_level,
        total_points = v_new_xp,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- XP not granted due to daily limit
    v_new_xp := v_old_xp;
    v_new_level := v_old_level;
  END IF;

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up, v_unlocked_badges, v_xp_granted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Add image_url to word_contributions
-- ============================================
ALTER TABLE word_contributions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================
-- RLS POLICIES: Admin access
-- ============================================

-- Admins can view all word contributions
CREATE POLICY "Admins can view all contributions"
  ON word_contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update word contributions (approve/reject)
CREATE POLICY "Admins can update contributions"
  ON word_contributions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Admins can update user roles
CREATE POLICY "Admins can update user roles"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN users.role IS 'User role: apprenant (default) or admin';
COMMENT ON COLUMN user_stats.xp_gains_today IS 'Number of XP gains from word contributions today (max 5)';
COMMENT ON COLUMN user_stats.last_xp_gain_date IS 'Last date XP was gained from word contribution';
COMMENT ON COLUMN word_contributions.image_url IS 'URL or path to word illustration image';
COMMENT ON FUNCTION can_gain_xp_from_contribution IS 'Check if user can gain XP from word contribution today (max 5 times)';
