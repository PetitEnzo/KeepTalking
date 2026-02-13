-- ============================================
-- Migration: Fix XP NULL Bug
-- ============================================
-- This migration fixes the bug where XP and level can become NULL
-- when adding experience from word contributions

-- ============================================
-- FUNCTION: Fixed add_experience to handle NULL values
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
  -- Get current XP and level with COALESCE to handle NULL values
  SELECT COALESCE(us.experience_points, 0), COALESCE(u.level, 1)
  INTO v_old_xp, v_old_level
  FROM user_stats us
  JOIN users u ON u.user_id = us.user_id
  WHERE us.user_id = p_user_id;

  -- If no data found (user_stats or users row doesn't exist), initialize with defaults
  IF NOT FOUND OR v_old_xp IS NULL THEN
    v_old_xp := 0;
  END IF;
  IF NOT FOUND OR v_old_level IS NULL THEN
    v_old_level := 1;
  END IF;
  
  -- Log for debugging
  RAISE NOTICE 'add_experience called: user_id=%, old_xp=%, old_level=%, xp_amount=%, source=%', 
    p_user_id, v_old_xp, v_old_level, p_xp_amount, p_source;

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

    -- Update user_stats with COALESCE to prevent NULL
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

    -- Update users table level with COALESCE to prevent NULL
    UPDATE users
    SET level = v_new_level,
        total_points = v_new_xp,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log after update
    RAISE NOTICE 'XP updated: new_xp=%, new_level=%, level_up=%, xp_granted=%', 
      v_new_xp, v_new_level, v_level_up, v_xp_granted;
  ELSE
    -- XP not granted due to daily limit
    v_new_xp := v_old_xp;
    v_new_level := v_old_level;
    RAISE NOTICE 'XP NOT granted due to daily limit (max 5 per day)';
  END IF;

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up, v_unlocked_badges, v_xp_granted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Fix existing NULL values in users table
-- ============================================
UPDATE users 
SET 
  total_points = COALESCE(total_points, 0),
  level = COALESCE(level, 1)
WHERE 
  total_points IS NULL 
  OR level IS NULL;

-- ============================================
-- Add NOT NULL constraints with defaults
-- ============================================
ALTER TABLE users 
  ALTER COLUMN total_points SET DEFAULT 0,
  ALTER COLUMN level SET DEFAULT 1;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION add_experience IS 'Add experience points to user with NULL safety - XP never decreases';
