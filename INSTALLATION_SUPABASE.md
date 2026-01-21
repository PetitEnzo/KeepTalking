# 🚀 Guide d'Installation Supabase - KeepTalking

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour configurer la base de données Supabase avec le système de gamification complet (XP, badges, contributions, rôles admin).

---

## ⚙️ Étape 1 : Accéder à Supabase

1. **Connectez-vous** à votre dashboard Supabase : https://app.supabase.com
2. **Sélectionnez** votre projet **KeepTalking**
3. **Cliquez** sur **SQL Editor** (icône 📝 dans le menu latéral gauche)

---

## 📦 Étape 2 : Exécuter les Migrations

### Migration 1 : Système de Base (si pas déjà fait)

**Fichier** : `supabase/migrations/001_initial_schema.sql`

**Contenu** : Tables de base (users, lessons, exercises, user_progress)

**Action** :
1. Cliquez sur **New Query**
2. Copiez le contenu de `001_initial_schema.sql`
3. Collez dans l'éditeur
4. Cliquez sur **Run** (ou Ctrl+Enter)
5. ✅ Vérifiez le message "Success"

---

### Migration 2 : Champs d'Onboarding (si pas déjà fait)

**Fichier** : `supabase/migrations/002_add_onboarding_fields.sql`

**Contenu** : Ajout de `user_profile`, `user_level`, `user_goal`

**Action** :
1. **New Query**
2. Copiez `002_add_onboarding_fields.sql`
3. Collez et **Run**
4. ✅ Vérifiez "Success"

---

### Migration 3 : Système de Leveling ⭐ NOUVEAU

**Fichier** : `supabase/migrations/003_add_leveling_system.sql`

**Contenu** :
- Tables : `user_stats`, `badges`, `user_badges`, `word_contributions`
- Fonctions : `calculate_level()`, `add_experience()`, `can_contribute_word()`
- Badges initiaux (12 badges pré-créés)
- RLS policies

**Action** :
1. **New Query**
2. Copiez **TOUT** le contenu de `003_add_leveling_system.sql`
3. Collez dans l'éditeur
4. **Run**
5. ✅ Vérifiez "Success"

**Vérification** :
```sql
-- Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_stats', 'badges', 'user_badges', 'word_contributions');

-- Devrait retourner 4 lignes
```

```sql
-- Vérifier les badges créés
SELECT name, icon, unlock_level 
FROM badges 
ORDER BY unlock_level;

-- Devrait retourner 12 badges
```

---

### Migration 4 : Système Admin ⭐ NOUVEAU

**Fichier** : `supabase/migrations/004_add_admin_system.sql`

**Contenu** :
- Ajout du champ `role` dans `users`
- Ajout de `xp_gains_today` et `last_xp_gain_date` dans `user_stats`
- Modification de `add_experience()` pour limiter les gains XP (5/jour)
- Suppression de `can_contribute_word()` (plus de limite de mots)
- Nouvelle fonction `can_gain_xp_from_contribution()`
- RLS policies pour admins

**Action** :
1. **New Query**
2. Copiez **TOUT** le contenu de `004_add_admin_system.sql`
3. Collez dans l'éditeur
4. **Run**
5. ✅ Vérifiez "Success"

**Vérification** :
```sql
-- Vérifier le champ role
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role';

-- Devrait retourner : role | text
```

```sql
-- Vérifier les nouveaux champs user_stats
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
AND column_name IN ('xp_gains_today', 'last_xp_gain_date');

-- Devrait retourner 2 lignes
```

---

## 👤 Étape 3 : Créer votre Compte Admin

### Option A : Via SQL Editor (Recommandé)

```sql
-- 1. Trouver votre user_id
SELECT user_id, username, role 
FROM users 
WHERE username = 'VOTRE_USERNAME';
-- Notez votre user_id

-- 2. Promouvoir en admin
UPDATE users
SET role = 'admin'
WHERE username = 'VOTRE_USERNAME';

-- 3. Vérifier
SELECT username, role 
FROM users 
WHERE role = 'admin';
```

### Option B : Via Table Editor

1. Allez dans **Table Editor** → **users**
2. Trouvez votre ligne (par username)
3. Double-cliquez sur la colonne `role`
4. Changez `apprenant` → `admin`
5. Cliquez sur **Save**

---

## 🔍 Étape 4 : Vérifications Finales

### Vérifier les Tables

```sql
-- Liste de toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait inclure :
-- - users
-- - user_stats
-- - badges
-- - user_badges
-- - word_contributions
-- - lessons
-- - exercises
-- - user_progress
```

### Vérifier les Fonctions

```sql
-- Liste des fonctions personnalisées
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'calculate_level',
  'add_experience',
  'can_gain_xp_from_contribution',
  'create_user_profile',
  'create_user_stats'
);

-- Devrait retourner 5 fonctions
```

### Vérifier les RLS Policies

```sql
-- Policies sur word_contributions
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'word_contributions';

-- Devrait inclure :
-- - Users can view own contributions
-- - Users can insert own contributions
-- - Anyone can view approved contributions
-- - Admins can view all contributions
-- - Admins can update contributions
```

---

## 🧪 Étape 5 : Tests

### Test 1 : Ajouter de l'XP

```sql
-- Remplacez USER_ID par votre user_id
SELECT * FROM add_experience(
  'USER_ID'::UUID,
  100,
  'test'
);

-- Devrait retourner :
-- new_xp: 100
-- new_level: 2
-- level_up: true
-- unlocked_badges: [{"badge_id": "...", "name": "Apprenti", ...}]
-- xp_granted: true
```

### Test 2 : Vérifier les Badges Débloqués

```sql
-- Remplacez USER_ID par votre user_id
SELECT 
  b.name,
  b.icon,
  b.unlock_level,
  ub.unlocked_at
FROM user_badges ub
JOIN badges b ON b.badge_id = ub.badge_id
WHERE ub.user_id = 'USER_ID'::UUID
ORDER BY ub.unlocked_at;

-- Devrait afficher les badges débloqués (Débutant, Apprenti si niveau 2)
```

### Test 3 : Limite XP Quotidienne

```sql
-- Remplacez USER_ID par votre user_id
-- Exécutez 6 fois
SELECT * FROM add_experience(
  'USER_ID'::UUID,
  50,
  'word_contribution'
);

-- Les 5 premières fois : xp_granted = true
-- La 6ème fois : xp_granted = false (limite atteinte)
```

### Test 4 : Ajouter une Contribution

```sql
-- Remplacez USER_ID par votre user_id
INSERT INTO word_contributions (
  user_id,
  word,
  difficulty,
  syllables,
  status
) VALUES (
  'USER_ID'::UUID,
  'Test',
  'beginner',
  '[{"text": "Test", "consonne": "T", "voyelle": "e", "hand_sign_key": "R", "hand_position_config": 1, "description": "Test"}]'::JSONB,
  'pending'
);

-- Vérifier
SELECT word, status, created_at
FROM word_contributions
WHERE user_id = 'USER_ID'::UUID;
```

### Test 5 : Approuver une Contribution (Admin)

```sql
-- Remplacez CONTRIBUTION_ID et ADMIN_USER_ID
UPDATE word_contributions
SET 
  status = 'approved',
  reviewed_by = 'ADMIN_USER_ID'::UUID,
  reviewed_at = NOW()
WHERE contribution_id = 'CONTRIBUTION_ID'::UUID;

-- Vérifier
SELECT word, status, reviewed_at
FROM word_contributions
WHERE contribution_id = 'CONTRIBUTION_ID'::UUID;
```

---

## 🎯 Étape 6 : Utilisation dans l'Application

### Rafraîchir l'Application

1. **Arrêtez** le serveur de développement (Ctrl+C)
2. **Relancez** : `npm start` ou `expo start`
3. **Rafraîchissez** l'application (R dans le terminal ou secouez le téléphone)

### Vérifier les Nouvelles Pages

#### Page "Ajouter un mot"
1. Menu latéral → **✍️ Ajouter un mot**
2. Remplissez le formulaire
3. Ajoutez des syllabes
4. Soumettez
5. ✅ Devrait afficher "Mot ajouté avec succès !"

#### Page "Administration"
1. Menu latéral → **🛡️ Administration**
2. Si vous n'êtes **pas admin** → Message "Accès refusé"
3. Si vous êtes **admin** → Interface de modération

**Onglet Contributions** :
- Filtrez par statut
- Approuvez/Rejetez les mots

**Onglet Utilisateurs** :
- Recherchez un utilisateur
- Changez les rôles

---

## 🐛 Dépannage

### Erreur : "relation user_stats does not exist"

**Cause** : Migration 3 pas exécutée

**Solution** :
1. Retournez à l'Étape 2, Migration 3
2. Exécutez `003_add_leveling_system.sql`
3. Vérifiez avec `SELECT * FROM user_stats LIMIT 1;`

---

### Erreur : "function add_experience does not exist"

**Cause** : Fonction pas créée

**Solution** :
```sql
-- Vérifier si la fonction existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'add_experience';

-- Si vide, ré-exécutez la migration 3
```

---

### Erreur : "column role does not exist"

**Cause** : Migration 4 pas exécutée

**Solution** :
1. Exécutez `004_add_admin_system.sql`
2. Vérifiez avec `SELECT role FROM users LIMIT 1;`

---

### Erreur : "permission denied for table word_contributions"

**Cause** : RLS policies pas appliquées ou utilisateur pas admin

**Solution** :
```sql
-- Vérifier votre rôle
SELECT username, role FROM users WHERE auth_user_id = auth.uid();

-- Si pas admin, promouvoir :
UPDATE users SET role = 'admin' WHERE username = 'VOTRE_USERNAME';
```

---

### Les badges ne se débloquent pas

**Cause** : Badges pas insérés ou fonction défaillante

**Solution** :
```sql
-- Vérifier les badges
SELECT COUNT(*) FROM badges;
-- Devrait retourner 12

-- Si 0, ré-exécutez la section INSERT INTO badges de la migration 3

-- Tester manuellement
SELECT * FROM add_experience('USER_ID'::UUID, 100, 'test');
-- Vérifier unlocked_badges dans le résultat
```

---

### L'XP ne s'ajoute pas dans l'app

**Cause** : Service XP pas appelé ou user_id incorrect

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les logs d'erreur
3. Testez manuellement en SQL :
```sql
SELECT * FROM add_experience('USER_ID'::UUID, 20, 'training');
```

---

## 📊 Requêtes Utiles

### Statistiques Générales

```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM users;

-- Répartition des rôles
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Niveau moyen
SELECT AVG(level) as avg_level FROM users;

-- Total XP dans le système
SELECT SUM(total_points) as total_xp FROM users;
```

### Top Utilisateurs

```sql
-- Top 10 par XP
SELECT username, level, total_points, current_streak
FROM users
ORDER BY total_points DESC
LIMIT 10;

-- Top contributeurs
SELECT 
  u.username,
  us.total_words_contributed
FROM users u
JOIN user_stats us ON u.user_id = us.user_id
WHERE us.total_words_contributed > 0
ORDER BY us.total_words_contributed DESC
LIMIT 10;
```

### Contributions

```sql
-- Contributions en attente
SELECT COUNT(*) FROM word_contributions WHERE status = 'pending';

-- Dernières contributions
SELECT 
  wc.word,
  wc.difficulty,
  wc.status,
  u.username,
  wc.created_at
FROM word_contributions wc
JOIN users u ON u.user_id = wc.user_id
ORDER BY wc.created_at DESC
LIMIT 20;

-- Taux d'approbation
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM word_contributions
WHERE status IN ('approved', 'rejected')
GROUP BY status;
```

### Badges

```sql
-- Badges les plus débloqués
SELECT 
  b.name,
  b.icon,
  COUNT(ub.user_id) as unlock_count
FROM badges b
LEFT JOIN user_badges ub ON b.badge_id = ub.badge_id
GROUP BY b.badge_id, b.name, b.icon
ORDER BY unlock_count DESC;

-- Utilisateurs avec le plus de badges
SELECT 
  u.username,
  COUNT(ub.badge_id) as badge_count
FROM users u
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
GROUP BY u.username
ORDER BY badge_count DESC
LIMIT 10;
```

---

## 🔐 Sécurité

### Row Level Security (RLS)

**Toutes les tables ont RLS activé** :
- ✅ `users` : Utilisateurs voient leur profil + profils publics
- ✅ `user_stats` : Utilisateurs voient leurs stats
- ✅ `badges` : Tous peuvent voir
- ✅ `user_badges` : Tous peuvent voir (profil public)
- ✅ `word_contributions` : 
  - Utilisateurs voient leurs contributions
  - Tous voient les contributions approuvées
  - **Admins voient tout**

### Policies Admin

**Admins peuvent** :
- Voir toutes les contributions
- Modifier les contributions (approve/reject)
- Voir tous les utilisateurs
- Modifier les rôles des utilisateurs

**Vérification** :
```sql
-- Policies admin sur word_contributions
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'word_contributions'
AND policyname LIKE '%Admin%';
```

---

## 📞 Support

### Logs Supabase

1. Dashboard → **Logs**
2. Filtrez par :
   - **API** : Requêtes HTTP
   - **Database** : Erreurs SQL
   - **Auth** : Authentification

### Logs Application

1. Ouvrez la console navigateur (F12)
2. Onglet **Console**
3. Recherchez les erreurs rouges
4. Vérifiez les logs de `xpService.ts`

### Documentation

- **Supabase** : https://supabase.com/docs
- **PostgreSQL** : https://www.postgresql.org/docs/
- **React Native** : https://reactnative.dev/docs/getting-started

---

## ✅ Checklist Finale

Avant de considérer l'installation terminée :

- [ ] Migration 1 exécutée (tables de base)
- [ ] Migration 2 exécutée (onboarding)
- [ ] Migration 3 exécutée (leveling system)
- [ ] Migration 4 exécutée (admin system)
- [ ] 12 badges créés dans la table `badges`
- [ ] Au moins 1 utilisateur promu admin
- [ ] Test d'ajout d'XP réussi
- [ ] Test de déblocage de badge réussi
- [ ] Test de limite XP quotidienne réussi
- [ ] Page "Ajouter un mot" accessible
- [ ] Page "Administration" accessible (admin uniquement)
- [ ] Contribution de mot testée
- [ ] Approbation de mot testée (admin)
- [ ] RLS policies vérifiées

---

**Félicitations ! 🎉**

Votre système de gamification est maintenant opérationnel. Les utilisateurs peuvent :
- Gagner de l'XP en s'entraînant
- Monter de niveau et débloquer des badges
- Contribuer des mots à la communauté
- Voir leur progression

Les admins peuvent :
- Modérer les contributions
- Gérer les utilisateurs
- Changer les rôles

**Prochaines étapes** :
1. Testez avec de vrais utilisateurs
2. Collectez des feedbacks
3. Ajustez les valeurs d'XP si nécessaire
4. Implémentez les phases 2-4 (voir `GAMIFICATION_MEMOIRE.md`)

---

**Date de création** : 21 janvier 2026  
**Version** : 1.0.0  
**Dernière mise à jour** : 21 janvier 2026
