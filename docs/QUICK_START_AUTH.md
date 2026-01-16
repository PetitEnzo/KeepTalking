# 🚀 Quick Start - Authentification

Guide rapide pour tester le système d'authentification de KeepTalking.

## ⚡ Démarrage rapide

### 1. Configuration Supabase (5 minutes)

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)

2. **Copier les credentials** :
   ```bash
   # Créer le fichier .env à la racine
   cp .env.example .env
   ```

3. **Remplir le .env** :
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Exécuter la migration SQL** :
   - Ouvrir Supabase Dashboard > SQL Editor
   - Copier le contenu de `supabase/migrations/001_initial_schema.sql`
   - Exécuter

5. **Activer la vérification email** :
   - Supabase Dashboard > Authentication > Settings
   - ✅ Enable Email Confirmations

### 2. Lancer l'application (1 minute)

```bash
# Installer les dépendances
npm install

# Lancer l'app
npm start

# Choisir la plateforme
# - Appuyer sur 'w' pour web
# - Appuyer sur 'a' pour Android
# - Appuyer sur 'i' pour iOS
```

### 3. Tester le flux d'authentification (2 minutes)

#### Inscription

1. L'app s'ouvre sur l'écran de **Login**
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire :
   - Username : `testuser`
   - Email : `votre@email.com` (utilisez un vrai email)
   - Password : `Test1234!`
   - Confirm Password : `Test1234!`
   - ✅ Accepter les CGU
4. Cliquer **"Créer mon compte"**
5. Vous êtes redirigé vers **Verify Email**

#### Vérification Email

1. Ouvrir votre boîte email
2. Chercher l'email de Supabase (vérifier les spams)
3. Cliquer sur **"Confirm your email"**
4. L'app détecte automatiquement la vérification (polling 5s)
5. Vous êtes redirigé vers l'**application principale**

#### Connexion

1. Se déconnecter (Profil > Se déconnecter)
2. Retour à l'écran de Login
3. Entrer email et mot de passe
4. Cliquer **"Se connecter"**
5. Accès direct à l'app (email déjà vérifié)

---

## 🎯 Fonctionnalités à tester

### ✅ Inscription
- [ ] Validation username (3-20 caractères)
- [ ] Validation email (format)
- [ ] Validation password (8+ caractères)
- [ ] Indicateur de force du mot de passe
- [ ] Vérification correspondance passwords
- [ ] Checkbox CGU obligatoire
- [ ] Messages d'erreur en français

### ✅ Vérification Email
- [ ] Affichage de l'email utilisateur
- [ ] Bouton "Renvoyer l'email" avec cooldown 60s
- [ ] Polling automatique toutes les 5s
- [ ] Redirection auto après vérification
- [ ] Bouton "Changer d'email" (retour signup)

### ✅ Connexion
- [ ] Validation email/password
- [ ] Blocage si email non vérifié
- [ ] Message d'erreur si credentials incorrects
- [ ] Lien "Mot de passe oublié"
- [ ] Lien "Créer un compte"
- [ ] Toggle visibilité password

### ✅ Mot de passe oublié
- [ ] Input email
- [ ] Envoi email de réinitialisation
- [ ] Écran de confirmation
- [ ] Retour vers login

### ✅ Routing Conditionnel
- [ ] Redirection login si non connecté
- [ ] Redirection verify-email si email non vérifié
- [ ] Redirection tabs si connecté et vérifié
- [ ] Splash screen pendant chargement initial

### ✅ Navigation Tabs
- [ ] Tab Accueil : Dashboard avec stats
- [ ] Tab Leçons : Liste des leçons
- [ ] Tab Progression : Statistiques et achievements
- [ ] Tab Profil : Infos user et déconnexion

---

## 🐛 Problèmes courants

### Email de confirmation non reçu

**Solution 1 :** Vérifier les spams

**Solution 2 :** Cliquer sur "Renvoyer l'email"

**Solution 3 :** Vérifier la configuration SMTP dans Supabase :
- Dashboard > Project Settings > Auth
- Vérifier que "Enable Email Confirmations" est activé

### Erreur "Invalid login credentials"

**Cause :** Email ou mot de passe incorrect

**Solution :** Utiliser "Mot de passe oublié" ou créer un nouveau compte

### Redirection infinie

**Cause :** Problème de session ou email non vérifié

**Solution :**
1. Clear AsyncStorage :
   ```javascript
   // Dans la console du navigateur (web)
   localStorage.clear();
   ```
2. Redémarrer l'app
3. Se reconnecter

### Erreur "Email already registered"

**Cause :** L'email est déjà utilisé

**Solution :** Utiliser "Mot de passe oublié" pour récupérer le compte

---

## 📱 Captures d'écran attendues

### 1. Login Screen
- Logo KeepTalking en haut
- Inputs Email et Password
- Bouton "Se connecter" (bleu)
- Liens "Mot de passe oublié" et "Créer un compte"

### 2. Sign Up Screen
- Logo en haut
- Inputs Username, Email, Password, Confirm Password
- Indicateur de force du mot de passe
- Checkbox CGU
- Bouton "Créer mon compte"

### 3. Verify Email Screen
- Icône enveloppe 📧
- Message "Vérifiez votre email"
- Email de l'utilisateur affiché
- Boutons "Renvoyer l'email" et "Changer d'email"

### 4. Tabs Navigation
- 4 tabs en bas : Accueil, Leçons, Progression, Profil
- Icônes emoji pour chaque tab
- Couleur active : bleu (#2563EB)

---

## 🎉 Félicitations !

Si tous les tests passent, votre système d'authentification fonctionne parfaitement !

**Prochaines étapes :**
1. Personnaliser les templates d'email dans Supabase
2. Implémenter les fonctionnalités de l'app (leçons, exercices)
3. Ajouter l'authentification sociale (Google, Apple)
4. Configurer les notifications push

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- `docs/AUTHENTICATION.md` - Documentation complète
- `docs/DATABASE.md` - Schéma de la base de données
- `docs/SUPABASE_SETUP.md` - Configuration Supabase détaillée

---

**Besoin d'aide ?** Consultez la section Dépannage dans `AUTHENTICATION.md`
