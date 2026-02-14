-- ============================================
-- Migration: Add Badges System
-- ============================================
-- This migration updates the badges system with 26 badges
-- and tracking for user badge unlocks
-- Note: badges and user_badges tables already exist from migration 003

-- ============================================
-- ALTER TABLE: badges - Add missing columns
-- ============================================

-- Add image_key column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'badges' AND column_name = 'image_key') THEN
    ALTER TABLE badges ADD COLUMN image_key TEXT;
  END IF;
END $$;

-- Add unlock_condition column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'badges' AND column_name = 'unlock_condition') THEN
    ALTER TABLE badges ADD COLUMN unlock_condition TEXT;
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'badges' AND column_name = 'category') THEN
    ALTER TABLE badges ADD COLUMN category TEXT;
  END IF;
END $$;

-- Add constraint on category after column is created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'badges_category_check') THEN
    ALTER TABLE badges ADD CONSTRAINT badges_category_check 
      CHECK (category IN ('progression', 'regularity', 'mastery', 'performance', 'social', 'challenge'));
  END IF;
END $$;

-- Drop unlock_level column if it exists (old system)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'badges' AND column_name = 'unlock_level') THEN
    ALTER TABLE badges DROP COLUMN unlock_level;
  END IF;
END $$;

-- ============================================
-- ALTER TABLE: user_badges - Add missing columns
-- ============================================

-- Add user_badge_id if it doesn't exist (for primary key)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_badges' AND column_name = 'user_badge_id') THEN
    ALTER TABLE user_badges ADD COLUMN user_badge_id UUID DEFAULT uuid_generate_v4();
  END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_badges' AND column_name = 'image_url') THEN
    ALTER TABLE user_badges ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);

-- ============================================
-- INSERT BADGES DATA
-- ============================================

-- Clear existing badges to avoid duplicates
DELETE FROM badges;

-- Progression Badges (7)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('Inscription', 'Vous avez rejoint Keep Talking !', '🎉', 'badge_inscription', '{"type": "always_unlocked"}', 'progression'),
('Première Étape', 'Compléter la première leçon', '🎯', 'badge_premiere_etape', '{"type": "lesson_completed", "lesson_id": "1"}', 'progression'),
('Apprenti LFPC', 'Atteindre le niveau 5', '📚', 'badge_apprenti_lfpc', '{"type": "level", "value": 5}', 'progression'),
('Pratiquant', 'Atteindre le niveau 10', '🎓', 'badge_pratiquant', '{"type": "level", "value": 10}', 'progression'),
('Expert en Devenir', 'Atteindre le niveau 20', '⭐', 'badge_expert_devenir', '{"type": "level", "value": 20}', 'progression'),
('Maître LFPC', 'Atteindre le niveau 50', '🏆', 'badge_maitre_lfpc', '{"type": "level", "value": 50}', 'progression'),
('Légende', 'Atteindre le niveau 100', '👑', 'badge_legende', '{"type": "level", "value": 100}', 'progression');

-- Regularity Badges (4)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('Début de Série', '3 jours consécutifs de pratique', '🔥', 'badge_debut_serie', '{"type": "streak", "value": 3}', 'regularity'),
('Marathonien', '7 jours consécutifs', '🏃', 'badge_marathonien', '{"type": "streak", "value": 7}', 'regularity'),
('Engagé', '30 jours consécutifs', '💪', 'badge_engage', '{"type": "streak", "value": 30}', 'regularity'),
('Inébranlable', '100 jours consécutifs', '🛡️', 'badge_inebranlable', '{"type": "streak", "value": 100}', 'regularity');

-- Mastery Badges (5)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('5 Configurations', 'Maîtriser les 5 premières configurations', '✋', 'badge_5_configs', '{"type": "lessons_completed", "lesson_ids": ["1", "2", "3", "4", "5"]}', 'mastery'),
('8 Configurations', 'Maîtriser toutes les 8 configurations de base', '🙌', 'badge_8_configs', '{"type": "lessons_completed", "lesson_ids": ["1", "2", "3", "4", "5", "6"]}', 'mastery'),
('Configuration Préférée', 'Obtenir 100% de réussite sur une configuration', '💯', 'badge_config_preferee', '{"type": "perfect_config", "value": 1}', 'mastery'),
('Maître des Voyelles', 'Maîtriser toutes les positions de voyelles', '🎵', 'badge_maitre_voyelles', '{"type": "lesson_completed", "lesson_id": "3"}', 'mastery'),
('Expert Consonnes', 'Maîtriser toutes les consonnes', '🔤', 'badge_expert_consonnes', '{"type": "lesson_completed", "lesson_id": "2"}', 'mastery');

-- Performance Badges (6)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('Sans Faute', '10 réponses correctes d''affilée', '✨', 'badge_sans_faute', '{"type": "streak_correct", "value": 10}', 'performance'),
('Perfection', '50 réponses correctes d''affilée', '💎', 'badge_perfection', '{"type": "streak_correct", "value": 50}', 'performance'),
('Vitesse Éclair', 'Répondre en moins de 2 secondes', '⚡', 'badge_vitesse_eclair', '{"type": "fast_answer", "time": 2}', 'performance'),
('Réflexes', '20 réponses rapides en une session', '🎯', 'badge_reflexes', '{"type": "fast_answers_session", "value": 20}', 'performance'),
('Points d''Or', 'Accumuler 1000 points', '🥇', 'badge_points_or', '{"type": "total_xp", "value": 1000}', 'performance'),
('Collectionneur', 'Accumuler 10 000 points', '💰', 'badge_collectionneur', '{"type": "total_xp", "value": 10000}', 'performance');

-- Social Badges (3)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('Pionnier', 'Être parmi les 100 premiers utilisateurs', '🚀', 'badge_pionnier', '{"type": "early_user", "value": 100}', 'social'),
('Contributeur', 'Contribuer un mot à la communauté', '🤝', 'badge_contributeur', '{"type": "word_contribution", "value": 1}', 'social'),
('Curieux', 'Explorer toutes les sections de l''app', '🔍', 'badge_curieux', '{"type": "explore_all", "sections": ["lessons", "training", "profile", "contribute"]}', 'social');

-- Challenge Badges (3)
INSERT INTO badges (name, description, icon, image_key, unlock_condition, category) VALUES
('Retour Gagnant', 'Reprendre l''entraînement après 30 jours d''absence', '🎊', 'badge_retour_gagnant', '{"type": "comeback", "days": 30}', 'challenge'),
('Session Intensive', 'Compléter 20 exercices en une session', '🔥', 'badge_session_intensive', '{"type": "exercises_session", "value": 20}', 'challenge'),
('Perfectionniste', 'Refaire un exercice jusqu''à obtenir 100%', '🎖️', 'badge_perfectionniste', '{"type": "retry_perfect", "value": 1}', 'challenge');

-- ============================================
-- FUNCTION: Check and unlock badges for a user
-- ============================================
CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TABLE(
  unlocked_badge_id UUID,
  unlocked_badge_name TEXT,
  unlocked_badge_description TEXT,
  unlocked_badge_icon TEXT,
  unlocked_badge_image_key TEXT
) AS $$
DECLARE
  v_user_level INTEGER;
  v_user_xp INTEGER;
  v_user_streak INTEGER;
  v_completed_lessons TEXT[];
  v_user_created_at TIMESTAMP WITH TIME ZONE;
  v_user_rank INTEGER;
  v_badge RECORD;
  v_condition JSONB;
  v_should_unlock BOOLEAN;
BEGIN
  -- Get user stats
  SELECT u.level, us.experience_points, u.current_streak, u.created_at
  INTO v_user_level, v_user_xp, v_user_streak, v_user_created_at
  FROM users u
  JOIN user_stats us ON u.user_id = us.user_id
  WHERE u.user_id = p_user_id;

  -- Get completed lessons
  SELECT ARRAY_AGG(DISTINCT lesson_id)
  INTO v_completed_lessons
  FROM user_lesson_progress
  WHERE user_id = p_user_id AND completed = true AND passed = true;

  -- Get user rank (for Pionnier badge)
  SELECT COUNT(*) + 1
  INTO v_user_rank
  FROM users
  WHERE created_at < v_user_created_at;

  -- Check each badge
  FOR v_badge IN 
    SELECT b.badge_id, b.name, b.description, b.icon, b.image_key, b.unlock_condition
    FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.badge_id
    )
  LOOP
    v_condition := v_badge.unlock_condition::JSONB;
    v_should_unlock := false;

    -- Check condition type
    CASE v_condition->>'type'
      WHEN 'level' THEN
        v_should_unlock := v_user_level >= (v_condition->>'value')::INTEGER;
      
      WHEN 'streak' THEN
        v_should_unlock := v_user_streak >= (v_condition->>'value')::INTEGER;
      
      WHEN 'total_xp' THEN
        v_should_unlock := v_user_xp >= (v_condition->>'value')::INTEGER;
      
      WHEN 'lesson_completed' THEN
        v_should_unlock := (v_condition->>'lesson_id') = ANY(v_completed_lessons);
      
      WHEN 'lessons_completed' THEN
        -- Check if all required lessons are completed
        v_should_unlock := (
          SELECT bool_and(lesson_id = ANY(v_completed_lessons))
          FROM jsonb_array_elements_text(v_condition->'lesson_ids') AS lesson_id
        );
      
      WHEN 'early_user' THEN
        v_should_unlock := v_user_rank <= (v_condition->>'value')::INTEGER;
      
      WHEN 'word_contribution' THEN
        v_should_unlock := (
          SELECT COUNT(*) >= (v_condition->>'value')::INTEGER
          FROM word_contributions
          WHERE user_id = p_user_id AND status = 'approved'
        );
      
      WHEN 'always_unlocked' THEN
        -- Badge débloqué automatiquement (ex: Inscription)
        v_should_unlock := true;
      
      ELSE
        -- For other types, we'll handle them in the app logic
        v_should_unlock := false;
    END CASE;

    -- Unlock badge if condition met
    IF v_should_unlock THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.badge_id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      -- Return unlocked badge
      RETURN QUERY SELECT 
        v_badge.badge_id,
        v_badge.name,
        v_badge.description,
        v_badge.icon,
        v_badge.image_key;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES for badges and user_badges
-- ============================================

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
DROP POLICY IF EXISTS "System can insert user badges" ON user_badges;

-- Badges: Everyone can read
CREATE POLICY "Anyone can view badges"
ON badges FOR SELECT
TO authenticated
USING (true);

-- User badges: Users can view their own badges
CREATE POLICY "Users can view their own badges"
ON user_badges FOR SELECT
TO authenticated
USING (user_id IN (SELECT user_id FROM users WHERE auth_user_id = auth.uid()));

-- User badges: System can insert (via function)
CREATE POLICY "System can insert user badges"
ON user_badges FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE badges IS 'Available badges in the system';
COMMENT ON TABLE user_badges IS 'Badges unlocked by users';
COMMENT ON FUNCTION check_and_unlock_badges IS 'Check and unlock badges for a user based on their progress';

-- ============================================
-- RETROACTIVE BADGE UNLOCK
-- ============================================
-- Unlock badges retroactively for all existing users
-- This will check all badge conditions for each user

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT user_id FROM users LOOP
    PERFORM check_and_unlock_badges(v_user.user_id);
  END LOOP;
  
  RAISE NOTICE 'Badges unlocked retroactively for all users';
END $$;
