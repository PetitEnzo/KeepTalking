# 🎮 Guide du Système de Leveling et Contribution

## 📋 Vue d'ensemble

Ce guide explique comment mettre en place et utiliser le nouveau système de leveling avec XP, badges et contribution de mots.

## 🗄️ 1. Appliquer la migration SQL

### Étape 1 : Connexion à Supabase

1. Connectez-vous à votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet **KeepTalking**
3. Allez dans **SQL Editor** (icône 📝 dans le menu latéral)

### Étape 2 : Exécuter la migration

1. Cliquez sur **New Query**
2. Copiez le contenu du fichier `supabase/migrations/003_add_leveling_system.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

### Étape 3 : Vérification

Vérifiez que les tables suivantes ont été créées :
- ✅ `user_stats`
- ✅ `badges`
- ✅ `user_badges`
- ✅ `word_contributions`

Vérifiez que les fonctions suivantes existent :
- ✅ `calculate_level(xp INTEGER)`
- ✅ `add_experience(p_user_id UUID, p_xp_amount INTEGER, p_source TEXT)`
- ✅ `can_contribute_word(p_user_id UUID)`

## 🎯 2. Fonctionnalités ajoutées

### ✍️ Page "Ajouter un mot"

**Fichier** : `src/app/(tabs)/contribute.tsx`

**Fonctionnalités** :
- Formulaire pour ajouter un nouveau mot LFPC
- Décomposition en syllabes avec configurations de main
- Limite de 5 mots par jour (anti-farm)
- Récompense : **50 XP** par mot validé
- Statut de modération (pending/approved/rejected)

**Accès** : Menu latéral → ✍️ Ajouter un mot

### 📊 Système de leveling

**Formule de niveau** :
```
Niveau = floor(sqrt(XP / 100)) + 1
```

**Progression** :
- Niveau 1 : 0-99 XP
- Niveau 2 : 100-399 XP
- Niveau 3 : 400-899 XP
- Niveau 4 : 900-1599 XP
- Niveau 5 : 1600-2499 XP
- etc.

### 🏆 Système de badges

**Badges automatiques** (débloqués par niveau) :
- 🌱 **Débutant** (Niveau 1)
- 📚 **Apprenti** (Niveau 2)
- 💪 **Pratiquant** (Niveau 3)
- ⭐ **Expert** (Niveau 5)
- 🏆 **Maître** (Niveau 10)
- 👑 **Légende** (Niveau 20)

**Badges de contribution** :
- ✍️ **Contributeur** (1er mot ajouté)
- 📖 **Érudit** (10 mots contribués)
- 📚 **Encyclopédie** (50 mots contribués)

**Badges de streak** :
- 🔥 **Assidu** (7 jours de suite)
- 🏃 **Marathonien** (30 jours de suite)
- 🥇 **Champion** (100 jours de suite)

### ⭐ Gains d'XP

| Action | XP gagné |
|--------|----------|
| Session d'entraînement | 20 XP |
| Leçon complétée | 100 XP |
| Mot contribué (validé) | 50 XP |
| Streak quotidien | 10 XP |
| Exercice complété | 15 XP |

## 🔧 3. Intégration dans le code existant

### Service XP

**Fichier** : `src/services/xpService.ts`

**Fonctions disponibles** :

```typescript
import { addExperience, getUserStats, getXPProgress, XP_REWARDS } from '../services/xpService';

// Ajouter de l'XP
const result = await addExperience(userId, XP_REWARDS.TRAINING_SESSION, 'training');
if (result?.level_up) {
  console.log('Level up!', result.unlocked_badges);
}

// Récupérer les stats utilisateur
const stats = await getUserStats(userId);
console.log('Level:', stats.level, 'XP:', stats.total_points);

// Calculer la progression vers le niveau suivant
const progress = getXPProgress(stats.total_points, stats.level);
console.log('Progress:', progress.progress + '%');
```

### Intégration dans training.tsx

**À ajouter** après la validation d'une syllabe :

```typescript
import { addExperience, XP_REWARDS } from '../../services/xpService';

// Dans handleSyllableValidated()
const { data: userData } = await supabase
  .from('users')
  .select('user_id')
  .eq('auth_user_id', user.id)
  .single();

if (userData) {
  await addExperience(
    userData.user_id,
    XP_REWARDS.TRAINING_SESSION,
    'training'
  );
}
```

### Intégration dans lessons

**À ajouter** après la complétion d'une leçon :

```typescript
import { addExperience, XP_REWARDS } from '../../services/xpService';

// Après avoir marqué la leçon comme complétée
const result = await addExperience(
  userData.user_id,
  XP_REWARDS.LESSON_COMPLETED,
  'lesson_completed'
);

if (result?.level_up) {
  // Afficher une notification de level up
  Alert.alert(
    '🎉 Level Up!',
    `Félicitations ! Vous êtes maintenant niveau ${result.new_level} !`,
    [{ text: 'Super !' }]
  );
  
  // Afficher les badges débloqués
  if (result.unlocked_badges.length > 0) {
    const badgeNames = result.unlocked_badges.map(b => b.name).join(', ');
    Alert.alert(
      '🏆 Nouveaux badges !',
      `Vous avez débloqué : ${badgeNames}`,
      [{ text: 'Génial !' }]
    );
  }
}
```

## 📱 4. Mise à jour de la page profil

**TODO** : Ajouter l'affichage du niveau, XP et badges dans `profile.tsx`

```typescript
import { getUserStats, getXPProgress } from '../../services/xpService';

// Dans loadUserProgress()
const stats = await getUserStats(userData.user_id);
if (stats) {
  setLevel(stats.level);
  setXP(stats.total_points);
  setBadges(stats.badges);
  
  const progress = getXPProgress(stats.total_points, stats.level);
  setXPProgress(progress);
}
```

**Affichage suggéré** :

```tsx
{/* Niveau et XP */}
<View style={styles.levelCard}>
  <Text style={styles.levelBadge}>Niveau {level}</Text>
  <View style={styles.xpBar}>
    <View style={[styles.xpFill, { width: `${xpProgress.progress}%` }]} />
  </View>
  <Text style={styles.xpText}>
    {xpProgress.currentLevelXP} / {xpProgress.nextLevelXP} XP
  </Text>
</View>

{/* Badges */}
<View style={styles.badgesSection}>
  <Text style={styles.sectionTitle}>🏆 Badges</Text>
  <View style={styles.badgesGrid}>
    {badges.map((badge) => (
      <View key={badge.badge_id} style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>{badge.badges.icon}</Text>
        <Text style={styles.badgeName}>{badge.badges.name}</Text>
      </View>
    ))}
  </View>
</View>
```

## 🔒 5. Sécurité et anti-farm

### Limite quotidienne de contribution

- **Maximum** : 5 mots par jour
- **Reset** : Minuit (heure serveur)
- **Vérification** : Fonction `can_contribute_word(user_id)`

### Modération des mots

Tous les mots ajoutés ont le statut `pending` par défaut et doivent être approuvés par un modérateur avant d'apparaître dans l'application.

**Pour approuver un mot** (admin uniquement) :

```sql
UPDATE word_contributions
SET status = 'approved',
    reviewed_by = 'ADMIN_USER_ID',
    reviewed_at = NOW()
WHERE contribution_id = 'CONTRIBUTION_ID';
```

**Pour rejeter un mot** :

```sql
UPDATE word_contributions
SET status = 'rejected',
    reviewed_by = 'ADMIN_USER_ID',
    reviewed_at = NOW()
WHERE contribution_id = 'CONTRIBUTION_ID';
```

## 📊 6. Requêtes utiles

### Voir les contributions en attente

```sql
SELECT 
  wc.word,
  wc.difficulty,
  wc.created_at,
  u.username
FROM word_contributions wc
JOIN users u ON u.user_id = wc.user_id
WHERE wc.status = 'pending'
ORDER BY wc.created_at DESC;
```

### Voir le classement des utilisateurs

```sql
SELECT 
  u.username,
  u.level,
  u.total_points,
  u.current_streak,
  us.total_words_contributed
FROM users u
JOIN user_stats us ON us.user_id = u.user_id
ORDER BY u.total_points DESC
LIMIT 10;
```

### Voir les badges d'un utilisateur

```sql
SELECT 
  b.name,
  b.description,
  b.icon,
  ub.unlocked_at
FROM user_badges ub
JOIN badges b ON b.badge_id = ub.badge_id
WHERE ub.user_id = 'USER_ID'
ORDER BY ub.unlocked_at DESC;
```

## 🚀 7. Prochaines étapes

### Fonctionnalités à implémenter

1. **Affichage du niveau/XP dans le profil** ✅ (fichier créé, à intégrer)
2. **Intégration XP dans training.tsx** ⏳ (à faire)
3. **Intégration XP dans lessons** ⏳ (à faire)
4. **Page d'administration pour modérer les mots** ⏳ (à créer)
5. **Classement des utilisateurs** ⏳ (à créer)
6. **Notifications de level up** ⏳ (à implémenter)
7. **Affichage des badges dans le profil** ⏳ (à implémenter)

### Améliorations futures

- Système de récompenses (débloquer des avatars, thèmes, etc.)
- Défis quotidiens/hebdomadaires
- Système de parrainage (XP bonus pour inviter des amis)
- Achievements spéciaux (100% de précision, etc.)
- Leaderboards par période (jour/semaine/mois)

## 🐛 8. Dépannage

### Erreur : "function add_experience does not exist"

➡️ La migration n'a pas été appliquée. Exécutez le fichier SQL dans Supabase.

### Erreur : "relation user_stats does not exist"

➡️ Les tables n'ont pas été créées. Vérifiez que la migration s'est exécutée sans erreur.

### Les badges ne se débloquent pas

➡️ Vérifiez que les badges ont été insérés dans la table `badges` :

```sql
SELECT * FROM badges ORDER BY unlock_level;
```

### L'XP ne s'ajoute pas

➡️ Vérifiez les logs de la fonction :

```typescript
const result = await addExperience(userId, 50, 'test');
console.log('XP Result:', result);
```

## 📞 Support

Pour toute question ou problème, consultez :
- La documentation Supabase : https://supabase.com/docs
- Les logs de la console navigateur (F12)
- Les logs Supabase (Dashboard → Logs)

---

**Dernière mise à jour** : 21 janvier 2026
**Version** : 1.0.0
