# Système d'Authentification - KeepTalking

Documentation complète du système d'authentification avec Supabase et vérification email obligatoire.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Flux d'authentification](#flux-dauthentification)
5. [Écrans](#écrans)
6. [Composants](#composants)
7. [Sécurité](#sécurité)
8. [Tests](#tests)

---

## 🎯 Vue d'ensemble

Le système d'authentification de KeepTalking utilise **Supabase Auth** avec les fonctionnalités suivantes :

- ✅ Inscription avec vérification email **obligatoire**
- ✅ Connexion avec email/mot de passe
- ✅ Réinitialisation de mot de passe
- ✅ Gestion de session persistante (AsyncStorage)
- ✅ Routing conditionnel automatique
- ✅ Création automatique du profil utilisateur
- ✅ Messages d'erreur en français

---

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── services/
│   └── supabase.ts                 # Client Supabase configuré
├── contexts/
│   └── AuthContext.tsx             # Contexte d'authentification global
├── components/auth/
│   ├── TextInput.tsx               # Input texte stylisé
│   ├── PasswordInput.tsx           # Input mot de passe avec toggle
│   ├── AuthButton.tsx              # Bouton avec loading state
│   ├── PasswordStrengthIndicator.tsx # Indicateur force mot de passe
│   └── ErrorMessage.tsx            # Affichage erreurs
└── app/
    ├── _layout.tsx                 # Routing conditionnel racine
    ├── (auth)/
    │   ├── _layout.tsx             # Layout groupe auth
    │   ├── login.tsx               # Écran connexion
    │   ├── signup.tsx              # Écran inscription
    │   ├── verify-email.tsx        # Écran vérification email
    │   └── forgot-password.tsx     # Écran mot de passe oublié
    └── (tabs)/
        ├── _layout.tsx             # Layout tabs app principale
        ├── index.tsx               # Accueil
        ├── lessons.tsx             # Leçons
        ├── progress.tsx            # Progression
        └── profile.tsx             # Profil
```

### Flux de données

```
User Action
    ↓
AuthContext (signIn/signUp/signOut)
    ↓
Supabase Auth API
    ↓
Session Update (onAuthStateChange)
    ↓
RootLayoutNav (routing conditionnel)
    ↓
Redirection automatique
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Configuration Supabase

Le client est configuré dans `src/services/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Configuration Email dans Supabase

Dans le dashboard Supabase :

1. **Authentication > Email Templates**
   - Personnalisez les templates d'email
   - Configurez l'expéditeur

2. **Authentication > Settings**
   - ✅ Enable Email Confirmations
   - ✅ Disable Email Confirmations = **false**
   - Email confirmation redirect URL : laissez vide

---

## 🔄 Flux d'authentification

### 1. Inscription (Sign Up)

```
Utilisateur remplit le formulaire
    ↓
Validation côté client (email, password, username)
    ↓
signUp(email, password, username)
    ↓
Supabase crée le compte (email_confirmed_at = null)
    ↓
Création du profil dans table users
    ↓
Redirection vers verify-email
    ↓
Email de confirmation envoyé
```

### 2. Vérification Email

```
Utilisateur sur verify-email
    ↓
Polling toutes les 5 secondes (checkEmailVerified)
    ↓
Utilisateur clique sur le lien dans l'email
    ↓
Supabase met à jour email_confirmed_at
    ↓
Polling détecte la vérification
    ↓
Redirection automatique vers /(tabs)
```

### 3. Connexion (Sign In)

```
Utilisateur entre email/password
    ↓
signIn(email, password)
    ↓
Supabase vérifie les credentials
    ↓
Vérification email_confirmed_at
    ↓
Si non vérifié → Redirection verify-email
Si vérifié → Redirection /(tabs)
```

### 4. Routing Conditionnel

Le `RootLayoutNav` gère automatiquement les redirections :

```typescript
if (!user && !inAuthGroup) {
  router.replace('/(auth)/login');
} else if (user && !checkEmailVerified()) {
  router.replace('/(auth)/verify-email');
} else if (user && checkEmailVerified() && !inTabsGroup) {
  router.replace('/(tabs)');
}
```

---

## 📱 Écrans

### Login (`/(auth)/login`)

**Fonctionnalités :**
- Input email avec validation
- Input password avec toggle visibilité
- Lien "Mot de passe oublié"
- Lien "Créer un compte"
- Gestion erreurs (email non vérifié, credentials incorrects)

**Validations :**
- Email doit contenir @
- Tous les champs requis

### Sign Up (`/(auth)/signup`)

**Fonctionnalités :**
- Input username (3-20 caractères)
- Input email
- Input password avec indicateur de force
- Input confirmation password
- Checkbox CGU
- Validation complète côté client

**Validations :**
- Username : 3-20 caractères
- Email : format valide
- Password : minimum 8 caractères
- Passwords doivent correspondre
- CGU acceptées

### Verify Email (`/(auth)/verify-email`)

**Fonctionnalités :**
- Affichage email de l'utilisateur
- Bouton "Renvoyer l'email" (cooldown 60s)
- Bouton "Changer d'email"
- Polling automatique toutes les 5s
- Redirection auto quand vérifié

### Forgot Password (`/(auth)/forgot-password`)

**Fonctionnalités :**
- Input email
- Envoi lien de réinitialisation
- Écran de confirmation après envoi
- Retour vers login

---

## 🧩 Composants

### TextInput

Input texte réutilisable avec label, icône et gestion d'erreur.

```tsx
<TextInput
  label="Email"
  placeholder="votre@email.com"
  value={email}
  onChangeText={setEmail}
  error={error}
  icon={<Text>📧</Text>}
/>
```

### PasswordInput

Input mot de passe avec toggle visibilité.

```tsx
<PasswordInput
  label="Mot de passe"
  placeholder="••••••••"
  value={password}
  onChangeText={setPassword}
  error={error}
/>
```

### AuthButton

Bouton avec loading state et variantes.

```tsx
<AuthButton
  title="Se connecter"
  onPress={handleLogin}
  loading={loading}
  variant="primary" // ou "secondary"
/>
```

### PasswordStrengthIndicator

Indicateur visuel de la force du mot de passe.

```tsx
<PasswordStrengthIndicator password={password} />
```

**Critères de force :**
- Faible : < 8 caractères
- Moyen : 8+ caractères, quelques critères
- Fort : 12+ caractères, majuscules, minuscules, chiffres, caractères spéciaux

### ErrorMessage

Affichage d'erreurs avec icône.

```tsx
<ErrorMessage message={error} />
```

---

## 🔐 Sécurité

### Row Level Security (RLS)

Les politiques RLS sont définies dans la migration SQL :

**Table `users` :**
- ✅ Lecture : Utilisateur peut lire son propre profil et les profils publics
- ✅ Insertion : Automatique via trigger
- ✅ Mise à jour : Utilisateur peut modifier son propre profil

**Table `user_progress` :**
- ✅ Lecture : Utilisateur peut lire sa propre progression
- ✅ Insertion : Utilisateur peut créer sa propre progression
- ✅ Mise à jour : Utilisateur peut modifier sa propre progression
- ✅ Suppression : Utilisateur peut supprimer sa propre progression

### Validation des mots de passe

- Minimum 8 caractères (imposé par Supabase)
- Indicateur de force côté client
- Hachage automatique par Supabase (bcrypt)

### Gestion des sessions

- Tokens JWT stockés dans AsyncStorage
- Auto-refresh des tokens
- Session persistante entre les redémarrages

---

## 🧪 Tests

### Test du flux complet

1. **Inscription**
   ```bash
   1. Ouvrir l'app
   2. Cliquer "Créer un compte"
   3. Remplir le formulaire
   4. Vérifier redirection vers verify-email
   ```

2. **Vérification Email**
   ```bash
   1. Ouvrir l'email de confirmation
   2. Cliquer sur le lien
   3. Vérifier redirection automatique vers l'app
   ```

3. **Connexion**
   ```bash
   1. Se déconnecter
   2. Se reconnecter avec les mêmes identifiants
   3. Vérifier accès direct à l'app
   ```

4. **Mot de passe oublié**
   ```bash
   1. Cliquer "Mot de passe oublié"
   2. Entrer email
   3. Vérifier réception email
   4. Cliquer lien et réinitialiser
   ```

### Tests de sécurité

- [ ] Impossible de se connecter sans email vérifié
- [ ] Impossible d'accéder à /(tabs) sans être connecté
- [ ] Session persiste après redémarrage
- [ ] Déconnexion nettoie la session
- [ ] RLS empêche l'accès aux données d'autres utilisateurs

---

## 🐛 Dépannage

### Problème : Email de confirmation non reçu

**Solutions :**
1. Vérifier les spams
2. Vérifier la configuration SMTP dans Supabase
3. Utiliser le bouton "Renvoyer l'email"

### Problème : Redirection infinie

**Solutions :**
1. Vérifier que `email_confirmed_at` est bien défini
2. Vérifier les logs de routing dans la console
3. Clear AsyncStorage et réessayer

### Problème : Erreur "Email already registered"

**Solutions :**
1. L'email est déjà utilisé
2. Utiliser "Mot de passe oublié" pour récupérer le compte
3. Ou utiliser un autre email

---

## 📚 Ressources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## 🔄 Améliorations futures

- [ ] Authentification sociale (Google, Apple)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Biométrie (Face ID, Touch ID)
- [ ] Gestion des sessions multiples
- [ ] Historique des connexions
- [ ] Notifications push pour les connexions suspectes

---

**Dernière mise à jour :** 16 janvier 2026  
**Version :** 0.1.0
