# Configuration Supabase - KeepTalking

## 🎯 Guide pas à pas

### Étape 1 : Accéder à votre projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **KeepTalking** (ou celui que vous avez créé)

---

### Étape 2 : Exécuter la migration de la base de données

#### Option A : Via l'interface SQL Editor (Recommandé)

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql`
4. **Copiez tout le contenu** du fichier
5. **Collez-le** dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)
7. Attendez que toutes les commandes s'exécutent (vous verrez "Success" en vert)

#### Option B : Via Supabase CLI (Avancé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push
```

---

### Étape 3 : Vérifier que les tables sont créées

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir 4 nouvelles tables :
   - ✅ `users`
   - ✅ `lessons`
   - ✅ `exercises`
   - ✅ `user_progress`

3. Cliquez sur chaque table pour voir sa structure

---

### Étape 4 : Charger les données de test (Optionnel)

1. Retournez dans **SQL Editor**
2. Créez une **New query**
3. Ouvrez le fichier `supabase/seed.sql`
4. **Copiez et collez** le contenu
5. Cliquez sur **Run**

Cela va créer :
- 5 leçons d'exemple
- 11 exercices d'exemple

---

### Étape 5 : Vérifier les règles de sécurité (RLS)

1. Dans **Table Editor**, sélectionnez la table `user_progress`
2. Cliquez sur l'onglet **Policies** (ou **RLS**)
3. Vous devriez voir 4 politiques :
   - ✅ Users can view own progress
   - ✅ Users can insert own progress
   - ✅ Users can update own progress
   - ✅ Users can delete own progress

4. Vérifiez que **RLS is enabled** est activé (bouton vert)

---

### Étape 6 : Tester l'authentification

#### Créer un utilisateur de test

1. Dans le menu de gauche, cliquez sur **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Remplissez :
   - Email : `test@keeptalking.com`
   - Password : `Test123456!`
   - Auto Confirm User : ✅ (coché)
4. Cliquez sur **Create user**

#### Vérifier la création automatique du profil

1. Retournez dans **Table Editor** → Table `users`
2. Vous devriez voir un nouveau profil créé automatiquement
3. Le `auth_user_id` correspond à l'ID de l'utilisateur dans Authentication

---

### Étape 7 : Tester les requêtes

Dans **SQL Editor**, testez ces requêtes :

#### Voir toutes les leçons publiées

```sql
SELECT * FROM lessons WHERE is_published = true ORDER BY order_number;
```

#### Voir les exercices d'une leçon

```sql
SELECT * FROM exercises 
WHERE lesson_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY order_number;
```

#### Voir le profil d'un utilisateur

```sql
SELECT * FROM users LIMIT 1;
```

---

## ✅ Checklist de vérification

Avant de continuer, assurez-vous que :

- [ ] Les 4 tables sont créées (`users`, `lessons`, `exercises`, `user_progress`)
- [ ] Les données de seed sont chargées (5 leçons, 11 exercices)
- [ ] RLS est activé sur toutes les tables
- [ ] Les politiques RLS sont créées
- [ ] Un utilisateur de test existe
- [ ] Le profil utilisateur a été créé automatiquement

---

## 🔧 Dépannage

### Erreur : "relation already exists"

Si vous voyez cette erreur, cela signifie que les tables existent déjà. Vous pouvez :

1. **Supprimer les tables existantes** :
   ```sql
   DROP TABLE IF EXISTS user_progress CASCADE;
   DROP TABLE IF EXISTS exercises CASCADE;
   DROP TABLE IF EXISTS lessons CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. **Puis réexécuter** la migration complète

### Erreur : "permission denied"

Vérifiez que vous êtes bien connecté en tant qu'administrateur du projet.

### Les données de seed ne s'insèrent pas

Assurez-vous d'avoir d'abord exécuté la migration initiale (`001_initial_schema.sql`) avant le seed.

---

## 📊 Visualiser les données

### Via Supabase Table Editor

1. **Table Editor** → Sélectionnez une table
2. Vous pouvez :
   - Voir les données
   - Ajouter des lignes manuellement
   - Modifier des lignes
   - Supprimer des lignes

### Via SQL Editor

```sql
-- Statistiques rapides
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM exercises) as total_exercises,
  (SELECT COUNT(*) FROM user_progress) as total_progress;
```

---

## 🚀 Prochaines étapes

Une fois la base de données configurée :

1. ✅ Testez les requêtes dans votre application React Native
2. ✅ Implémentez les services dans `src/services/`
3. ✅ Créez les hooks personnalisés dans `src/hooks/`
4. ✅ Développez les écrans d'exercices
5. ✅ Ajoutez la gamification (points, streaks, niveaux)

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs dans **Logs** → **Postgres Logs**
3. Testez vos requêtes dans le SQL Editor

Votre base de données est maintenant prête pour KeepTalking ! 🎉
