# ✅ Vérification de la configuration Supabase

Guide étape par étape pour vérifier que tout est correctement configuré.

---

## 📋 Checklist de vérification

### ✅ 1. Vérifier que le projet Supabase existe

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Vous devriez voir votre projet dans la liste
4. Cliquez dessus pour l'ouvrir

**✓ OK si** : Vous voyez le dashboard de votre projet

---

### ✅ 2. Vérifier les clés API

1. Dans le dashboard, cliquez sur **⚙️ Settings** (en bas à gauche)
2. Cliquez sur **API** dans le menu
3. Vérifiez que vous voyez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : Une longue clé commençant par `eyJ...`

**✓ OK si** : Les deux clés sont visibles et vous pouvez les copier

**📝 Action** : Copiez ces valeurs dans votre fichier `.env` :
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### ✅ 3. Vérifier que les tables existent

1. Dans le dashboard, cliquez sur **🗄️ Database** (menu de gauche)
2. Cliquez sur **Tables**
3. Vous devriez voir ces tables :
   - ✅ `users` (profils utilisateurs)
   - ✅ `lessons` (leçons)
   - ✅ `exercises` (exercices)
   - ✅ `user_progress` (progression)
   - ✅ `user_exercise_attempts` (tentatives)

**✓ OK si** : Toutes les tables sont présentes

**❌ Si les tables n'existent pas** :
1. Cliquez sur **SQL Editor** (📝)
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql` de votre projet
4. Copiez TOUT le contenu
5. Collez dans l'éditeur SQL
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Attendez le message "Success. No rows returned"
8. Retournez dans **Database** > **Tables** pour vérifier

---

### ✅ 4. Vérifier l'authentification email

1. Dans le dashboard, cliquez sur **🔐 Authentication** (menu de gauche)
2. Cliquez sur **Settings** (sous Authentication)
3. Trouvez la section **Email Auth**
4. Vérifiez que :
   - ✅ **Enable Email Confirmations** est **ON** (activé)
   - ✅ **Enable Email Signup** est **ON** (activé)

**✓ OK si** : Les deux options sont activées (switch en bleu)

**📝 Si désactivé** : Cliquez sur le switch pour activer

---

### ✅ 5. Vérifier les politiques de sécurité (RLS)

1. Allez dans **Database** > **Tables**
2. Cliquez sur la table **`users`**
3. Cliquez sur l'onglet **Policies** (en haut)
4. Vous devriez voir au moins une politique active

**✓ OK si** : Des politiques RLS sont définies (la migration les crée automatiquement)

**ℹ️ Info** : Les politiques RLS (Row Level Security) protègent vos données. Elles sont créées automatiquement par la migration SQL.

---

### ✅ 6. Tester la connexion depuis l'app

1. Assurez-vous que votre fichier `.env` est bien configuré
2. Redémarrez l'application :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run web
   ```
3. Ouvrez l'app dans le navigateur
4. Cliquez sur "Commencer" ou "Connexion"

**✓ OK si** : 
- ✅ Pas d'erreur "Invalid API key"
- ✅ Les formulaires s'affichent correctement
- ✅ Vous pouvez taper dans les champs

**❌ Si erreur "Invalid API key"** :
- Vérifiez que le fichier `.env` existe à la racine
- Vérifiez qu'il n'y a pas d'espaces avant/après les `=`
- Vérifiez que les clés sont exactement celles de Supabase
- Redémarrez avec `npx expo start --clear` puis `npm run web`

---

### ✅ 7. Tester la création de compte

1. Dans l'app, cliquez sur "Commencer"
2. Remplissez le formulaire :
   - **Nom d'utilisateur** : testuser
   - **Email** : votre-vrai-email@gmail.com (utilisez un vrai email !)
   - **Mot de passe** : Test1234! (au moins 8 caractères)
   - **Confirmer** : Test1234!
   - ✅ Cochez "J'accepte les CGU"
3. Cliquez sur "Créer mon compte"

**✓ OK si** :
- ✅ Pas d'erreur
- ✅ Vous êtes redirigé vers l'écran "Vérifiez votre email"
- ✅ Vous voyez votre email affiché

**❌ Si erreur** :
- "Invalid API key" → Retour à l'étape 2 et 6
- "User already registered" → Normal si vous avez déjà créé ce compte
- Autre erreur → Vérifiez les logs dans la console du navigateur (F12)

---

### ✅ 8. Vérifier que l'email est envoyé

1. Après avoir créé le compte, allez dans votre boîte email
2. Cherchez un email de Supabase (vérifiez les spams !)
3. L'email devrait contenir un lien "Confirm your email"

**✓ OK si** : Vous avez reçu l'email

**❌ Si pas d'email** :
1. Vérifiez les spams
2. Dans Supabase Dashboard > **Authentication** > **Users**
3. Vous devriez voir votre utilisateur avec un statut "Waiting for verification"
4. Si l'utilisateur n'apparaît pas, il y a un problème de configuration

---

### ✅ 9. Vérifier la validation email

1. Cliquez sur le lien dans l'email de confirmation
2. Vous devriez voir une page "Email confirmed"
3. Retournez dans l'app (elle devrait toujours être sur "Vérifiez votre email")
4. Attendez 5 secondes maximum

**✓ OK si** :
- ✅ Vous êtes automatiquement redirigé vers la homepage
- ✅ Vous voyez le header avec votre avatar
- ✅ Vous pouvez ouvrir le menu latéral (☰)

**❌ Si pas de redirection** :
- Rafraîchissez la page (F5)
- Vérifiez dans Supabase Dashboard > **Authentication** > **Users** que le statut est "Confirmed"

---

### ✅ 10. Vérifier que le profil est créé

1. Dans Supabase Dashboard, allez dans **Database** > **Table Editor**
2. Sélectionnez la table **`users`**
3. Vous devriez voir une ligne avec :
   - **id** : UUID de votre utilisateur
   - **username** : Le nom que vous avez choisi
   - **email** : Votre email
   - **created_at** : Date de création

**✓ OK si** : Votre profil apparaît dans la table

---

## 🎯 Résumé : Tout est OK si...

✅ Projet Supabase créé et accessible  
✅ Clés API copiées dans `.env`  
✅ Tables créées (migration SQL exécutée)  
✅ Email confirmations activées  
✅ Pas d'erreur "Invalid API key" dans l'app  
✅ Création de compte fonctionne  
✅ Email de confirmation reçu  
✅ Validation email redirige vers la homepage  
✅ Profil créé dans la table `users`  

---

## 🐛 Problèmes courants

### Erreur "Invalid API key"
**Cause** : Fichier `.env` mal configuré  
**Solution** : Vérifiez étapes 2 et 6

### Pas d'email reçu
**Cause** : Email confirmations désactivées  
**Solution** : Vérifiez étape 4

### Tables n'existent pas
**Cause** : Migration SQL non exécutée  
**Solution** : Vérifiez étape 3

### Pas de redirection après validation
**Cause** : Session non rafraîchie  
**Solution** : Rafraîchir la page (F5)

---

## 📞 Commandes utiles

```bash
# Redémarrer l'app avec cache nettoyé
npx expo start --clear
npm run web

# Vérifier les variables d'environnement
# Windows PowerShell
Get-Content .env

# Voir les logs en temps réel
# Ouvrez la console du navigateur (F12) > Console
```

---

## ✅ Prêt à continuer ?

Si toutes les étapes sont validées, vous pouvez :
1. ✅ Créer des comptes utilisateurs
2. ✅ Se connecter/déconnecter
3. ✅ Réinitialiser le mot de passe
4. ✅ Naviguer dans l'application

**Prochaine étape** : Développer les fonctionnalités de l'app (leçons, exercices, progression) ! 🚀
