# Base de données KeepTalking

## 🗄️ Architecture

KeepTalking utilise **Supabase** (PostgreSQL) comme base de données avec Row Level Security (RLS) pour la sécurité.

## 📊 Schéma de la base de données

### Table: `users`

Profils utilisateurs avec données de gamification.

| Colonne | Type | Description |
|---------|------|-------------|
| `user_id` | UUID | Clé primaire |
| `auth_user_id` | UUID | Référence à auth.users |
| `username` | TEXT | Nom d'utilisateur unique (3-30 caractères) |
| `current_streak` | INTEGER | Nombre de jours consécutifs de pratique |
| `total_points` | INTEGER | Points cumulés |
| `level` | INTEGER | Niveau basé sur les points |
| `last_practice_date` | TIMESTAMP | Date de la dernière pratique |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Indexes:**
- `idx_users_auth_user_id` sur `auth_user_id`
- `idx_users_username` sur `username`

---

### Table: `lessons`

Leçons d'apprentissage du LfPC organisées par difficulté.

| Colonne | Type | Description |
|---------|------|-------------|
| `lesson_id` | UUID | Clé primaire |
| `title` | TEXT | Titre de la leçon |
| `description` | TEXT | Description |
| `difficulty` | TEXT | beginner, intermediate, advanced |
| `order_number` | INTEGER | Ordre d'affichage (unique) |
| `is_published` | BOOLEAN | Leçon publiée ou brouillon |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Indexes:**
- `idx_lessons_order` sur `order_number`
- `idx_lessons_difficulty` sur `difficulty`

---

### Table: `exercises`

Exercices individuels dans les leçons.

| Colonne | Type | Description |
|---------|------|-------------|
| `exercise_id` | UUID | Clé primaire |
| `lesson_id` | UUID | Référence à lessons |
| `type` | TEXT | recognition, production, comprehension, multiple_choice |
| `question` | TEXT | Question de l'exercice |
| `correct_answer` | TEXT | Réponse correcte |
| `options` | JSONB | Options pour choix multiples |
| `images` | JSONB | URLs des images |
| `points` | INTEGER | Points attribués (> 0) |
| `order_number` | INTEGER | Ordre dans la leçon |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de mise à jour |

**Indexes:**
- `idx_exercises_lesson_id` sur `lesson_id`
- `idx_exercises_type` sur `type`
- `idx_exercises_order` sur `(lesson_id, order_number)`

---

### Table: `user_progress`

Suivi de la progression des utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `progress_id` | UUID | Clé primaire |
| `user_id` | UUID | Référence à users |
| `lesson_id` | UUID | Référence à lessons |
| `exercise_id` | UUID | Référence à exercises |
| `completed` | BOOLEAN | Exercice complété |
| `score` | INTEGER | Score (0-100) |
| `attempts` | INTEGER | Nombre de tentatives |
| `timestamp` | TIMESTAMP | Date de complétion |

**Contraintes:**
- Unique sur `(user_id, exercise_id)`
- Score entre 0 et 100

**Indexes:**
- `idx_user_progress_user_id` sur `user_id`
- `idx_user_progress_lesson_id` sur `lesson_id`
- `idx_user_progress_completed` sur `(user_id, completed)`
- `idx_user_progress_timestamp` sur `timestamp DESC`

---

## 🔒 Sécurité (Row Level Security)

### Politique de sécurité par table

#### `users`
- ✅ **SELECT** : Les utilisateurs peuvent voir leur propre profil ET les profils publics des autres
- ✅ **UPDATE** : Les utilisateurs peuvent modifier uniquement leur propre profil
- ❌ **INSERT/DELETE** : Géré automatiquement par trigger

#### `lessons`
- ✅ **SELECT** : Tout le monde peut voir les leçons publiées
- ✅ **SELECT** : Les utilisateurs authentifiés peuvent voir toutes les leçons

#### `exercises`
- ✅ **SELECT** : Tout le monde peut voir les exercices des leçons publiées
- ✅ **SELECT** : Les utilisateurs authentifiés peuvent voir tous les exercices

#### `user_progress`
- ✅ **SELECT** : Les utilisateurs peuvent voir uniquement leur propre progression
- ✅ **INSERT** : Les utilisateurs peuvent créer uniquement leur propre progression
- ✅ **UPDATE** : Les utilisateurs peuvent modifier uniquement leur propre progression
- ✅ **DELETE** : Les utilisateurs peuvent supprimer uniquement leur propre progression

---

## 🔄 Triggers automatiques

### Auto-création du profil utilisateur

Lorsqu'un utilisateur s'inscrit via Supabase Auth, un profil est automatiquement créé dans la table `users`.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
```

### Mise à jour automatique des timestamps

Les colonnes `updated_at` sont automatiquement mises à jour lors des modifications.

```sql
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📝 Installation

### 1. Exécuter la migration initiale

Dans le **SQL Editor** de Supabase :

```sql
-- Copiez et exécutez le contenu de :
-- supabase/migrations/001_initial_schema.sql
```

### 2. Charger les données de test (optionnel)

```sql
-- Copiez et exécutez le contenu de :
-- supabase/seed.sql
```

---

## 🔍 Requêtes utiles

### Récupérer le profil d'un utilisateur

```typescript
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('auth_user_id', userId)
  .single();
```

### Récupérer toutes les leçons publiées

```typescript
const { data: lessons } = await supabase
  .from('lessons')
  .select('*')
  .eq('is_published', true)
  .order('order_number', { ascending: true });
```

### Récupérer les exercices d'une leçon

```typescript
const { data: exercises } = await supabase
  .from('exercises')
  .select('*')
  .eq('lesson_id', lessonId)
  .order('order_number', { ascending: true });
```

### Récupérer la progression d'un utilisateur

```typescript
const { data: progress } = await supabase
  .from('user_progress')
  .select(`
    *,
    exercises (
      question,
      type,
      points
    ),
    lessons (
      title,
      difficulty
    )
  `)
  .eq('user_id', userId)
  .order('timestamp', { ascending: false });
```

### Enregistrer la progression

```typescript
const { data, error } = await supabase
  .from('user_progress')
  .upsert({
    user_id: userId,
    lesson_id: lessonId,
    exercise_id: exerciseId,
    completed: true,
    score: 85,
    attempts: 1,
  }, {
    onConflict: 'user_id,exercise_id'
  });
```

### Mettre à jour les points et le streak

```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    total_points: totalPoints + earnedPoints,
    current_streak: newStreak,
    last_practice_date: new Date().toISOString(),
  })
  .eq('user_id', userId);
```

---

## 📈 Statistiques

### Calculer le niveau basé sur les points

```typescript
function calculateLevel(totalPoints: number): number {
  // 100 points par niveau
  return Math.floor(totalPoints / 100) + 1;
}
```

### Calculer le streak

```typescript
function calculateStreak(lastPracticeDate: string): number {
  const last = new Date(lastPracticeDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return currentStreak; // Même jour
  if (diffDays === 1) return currentStreak + 1; // Jour consécutif
  return 1; // Streak cassé, recommence à 1
}
```

---

## 🚀 Prochaines étapes

1. **Exécuter les migrations** dans Supabase
2. **Tester les requêtes** avec les données de seed
3. **Implémenter les services** TypeScript dans `src/services/`
4. **Créer les hooks** pour faciliter l'accès aux données
5. **Ajouter des fonctions** pour la gamification (calcul de niveau, streaks, etc.)

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
