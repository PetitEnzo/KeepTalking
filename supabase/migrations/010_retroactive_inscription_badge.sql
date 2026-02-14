-- ============================================
-- Migration: Attribution rétroactive du badge Inscription
-- ============================================
-- Ce script attribue le badge "Inscription" à tous les utilisateurs existants
-- qui ne l'ont pas encore reçu

-- Attribuer le badge Inscription à tous les utilisateurs existants
INSERT INTO user_badges (user_id, badge_id)
SELECT 
  u.user_id,
  b.badge_id
FROM users u
CROSS JOIN badges b
WHERE b.name = 'Inscription'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_badges ub 
    WHERE ub.user_id = u.user_id 
      AND ub.badge_id = b.badge_id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;
