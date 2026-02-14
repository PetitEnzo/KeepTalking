-- ============================================
-- Script: Ajouter le badge Inscription manuellement
-- ============================================
-- Ce script ajoute le badge "Inscription" à un utilisateur spécifique
-- Remplacer 'VOTRE_USER_ID' par l'ID de l'utilisateur

-- Pour trouver votre user_id, exécutez d'abord:
-- SELECT user_id, username, email FROM user_profiles;

-- Puis remplacez 'VOTRE_USER_ID' ci-dessous et exécutez:
INSERT INTO user_badges (user_id, badge_id)
SELECT 
  'VOTRE_USER_ID', -- Remplacer par votre user_id
  badge_id
FROM badges
WHERE name = 'Inscription'
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Vérifier que le badge a été ajouté:
-- SELECT ub.*, b.name, b.description 
-- FROM user_badges ub
-- JOIN badges b ON ub.badge_id = b.badge_id
-- WHERE ub.user_id = 'VOTRE_USER_ID';
