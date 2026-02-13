-- ============================================
-- Migration: Complete XP System Fix
-- ============================================
-- This migration completely rewrites the add_experience function
-- to be more robust and prevent XP loss issues

-- ============================================
-- FUNCTION: Completely rewritten add_experience
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
  v_old_xp INTEGER := 0;
  v_new_xp INTEGER := 0;
  v_old_level INTEGER := 1;
  v_new_level INTEGER := 1;
  v_level_up BOOLEAN := false;
  v_unlocked_badges JSONB := '[]'::JSONB;
  v_badge RECORD;
  v_can_gain_xp BOOLEAN := true;
  v_xp_granted BOOLEAN := false;
  v_user_stats_exists BOOLEAN := false;
  v_users_exists BOOLEAN := false;
BEGIN
  -- Log function call
  RAISE NOTICE '=== add_experience START ===';
  RAISE NOTICE 'Input: user_id=%, xp_amount=%, source=%', p_user_id, p_xp_amount, p_source;

  -- Check if user exists in users table
  SELECT EXISTS(SELECT 1 FROM users WHERE user_id = p_user_id) INTO v_users_exists;
  RAISE NOTICE 'User exists in users table: %', v_users_exists;
  
  IF NOT v_users_exists THEN
    RAISE EXCEPTION 'User % does not exist in users table', p_user_id;
  END IF;

  -- Check if user_stats exists
  SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = p_user_id) INTO v_user_stats_exists;
  RAISE NOTICE 'User stats exists: %', v_user_stats_exists;
  
  -- Create user_stats if it doesn't exist
  IF NOT v_user_stats_exists THEN
    RAISE NOTICE 'Creating user_stats for user %', p_user_id;
    INSERT INTO user_stats (user_id, experience_points)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Get current XP from user_stats
  SELECT COALESCE(experience_points, 0) INTO v_old_xp
  FROM user_stats
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Current XP from user_stats: %', v_old_xp;

  -- Get current level from users table
  SELECT COALESCE(level, 1) INTO v_old_level
  FROM users
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Current level from users: %', v_old_level;

  -- Check if source is word_contribution and if user can gain XP
  IF p_source = 'word_contribution' THEN
    v_can_gain_xp := can_gain_xp_from_contribution(p_user_id);
    RAISE NOTICE 'Can gain XP from contribution: %', v_can_gain_xp;
  END IF;

  -- Add XP only if allowed
  IF v_can_gain_xp THEN
    -- Calculate new XP (NEVER subtract, only add)
    v_new_xp := v_old_xp + p_xp_amount;
    v_xp_granted := true;
    
    RAISE NOTICE 'Calculating new XP: % + % = %', v_old_xp, p_xp_amount, v_new_xp;
    
    -- Calculate new level
    v_new_level := calculate_level(v_new_xp);
    RAISE NOTICE 'New level calculated: %', v_new_level;
    
    -- Check if leveled up
    IF v_new_level > v_old_level THEN
      v_level_up := true;
      RAISE NOTICE 'LEVEL UP! % -> %', v_old_level, v_new_level;
      
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
        RAISE NOTICE 'Unlocking badge: %', v_badge.name;
        
        -- Insert new badge
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_user_id, v_badge.badge_id)
        ON CONFLICT DO NOTHING;
        
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
    RAISE NOTICE 'Updating user_stats: experience_points=%', v_new_xp;
    UPDATE user_stats
    SET experience_points = v_new_xp,
        xp_gains_today = CASE 
          WHEN p_source = 'word_contribution' THEN COALESCE(xp_gains_today, 0) + 1
          ELSE COALESCE(xp_gains_today, 0)
        END,
        last_xp_gain_date = CASE 
          WHEN p_source = 'word_contribution' THEN CURRENT_DATE
          ELSE last_xp_gain_date
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RAISE NOTICE 'user_stats updated, rows affected: %', FOUND;

    -- Update users table
    RAISE NOTICE 'Updating users: level=%, total_points=%', v_new_level, v_new_xp;
    UPDATE users
    SET level = v_new_level,
        total_points = v_new_xp,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RAISE NOTICE 'users updated, rows affected: %', FOUND;
    
    -- Verify the update
    DECLARE
      v_verify_xp INTEGER;
      v_verify_level INTEGER;
    BEGIN
      SELECT total_points, level INTO v_verify_xp, v_verify_level
      FROM users
      WHERE user_id = p_user_id;
      
      RAISE NOTICE 'VERIFICATION: users table now has total_points=%, level=%', v_verify_xp, v_verify_level;
      
      IF v_verify_xp != v_new_xp OR v_verify_level != v_new_level THEN
        RAISE WARNING 'MISMATCH! Expected xp=%, level=% but got xp=%, level=%', 
          v_new_xp, v_new_level, v_verify_xp, v_verify_level;
      END IF;
    END;
  ELSE
    -- XP not granted due to daily limit
    v_new_xp := v_old_xp;
    v_new_level := v_old_level;
    RAISE NOTICE 'XP NOT granted - daily limit reached (max 5 per day)';
  END IF;

  RAISE NOTICE '=== add_experience END: new_xp=%, new_level=%, level_up=%, xp_granted=% ===', 
    v_new_xp, v_new_level, v_level_up, v_xp_granted;

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up, v_unlocked_badges, v_xp_granted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Ensure all users have user_stats entries
-- ============================================
INSERT INTO user_stats (user_id, experience_points)
SELECT u.user_id, COALESCE(u.total_points, 0)
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats us WHERE us.user_id = u.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Sync user_stats.experience_points with users.total_points
-- ============================================
UPDATE user_stats us
SET experience_points = COALESCE(u.total_points, 0)
FROM users u
WHERE us.user_id = u.user_id
AND us.experience_points != COALESCE(u.total_points, 0);

-- ============================================
-- Fix any NULL values
-- ============================================
UPDATE users 
SET 
  total_points = COALESCE(total_points, 0),
  level = COALESCE(level, 1)
WHERE 
  total_points IS NULL 
  OR level IS NULL;

UPDATE user_stats
SET experience_points = COALESCE(experience_points, 0)
WHERE experience_points IS NULL;

-- ============================================
-- Add constraints to prevent NULL in the future
-- ============================================
ALTER TABLE users 
  ALTER COLUMN total_points SET NOT NULL,
  ALTER COLUMN total_points SET DEFAULT 0,
  ALTER COLUMN level SET NOT NULL,
  ALTER COLUMN level SET DEFAULT 1;

ALTER TABLE user_stats
  ALTER COLUMN experience_points SET NOT NULL,
  ALTER COLUMN experience_points SET DEFAULT 0;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION add_experience IS 'Add experience points to user - NEVER decreases XP, includes extensive logging';
