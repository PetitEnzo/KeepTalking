# 🔑 Configuration Supabase - Guide Rapide

## Erreur "Invalid API key"

Cette erreur signifie que les clés API Supabase ne sont pas correctement configurées.

## ✅ Solution en 3 étapes

### 1. Créer votre projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte (gratuit)
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name** : KeepTalking (ou autre nom)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez le plus proche (Europe West par exemple)
5. Cliquez sur "Create new project"
6. Attendez 2-3 minutes que le projet soit créé

### 2. Récupérer vos clés API

1. Dans votre projet Supabase, cliquez sur l'icône **⚙️ Settings** (en bas à gauche)
2. Cliquez sur **API** dans le menu
3. Vous verrez deux sections importantes :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **Project API keys** :
     - `anon` `public` : C'est votre **ANON KEY** (clé publique)

### 3. Configurer votre fichier .env

1. **Créez un fichier `.env`** à la racine du projet (à côté de `package.json`)

2. **Copiez-collez** ce contenu en remplaçant par VOS clés :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Remplacez** :
   - `https://xxxxxxxxxxxxx.supabase.co` par votre **Project URL**
   - La longue clé `eyJ...` par votre **anon public key**

### 4. Exécuter la migration SQL

1. Dans Supabase Dashboard, cliquez sur **SQL Editor** (icône 📝)
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql` de votre projet
4. **Copiez tout le contenu** et collez-le dans l'éditeur SQL
5. Cliquez sur **Run** (ou Ctrl+Enter)
6. Vous devriez voir "Success. No rows returned"

### 5. Activer la vérification email

1. Dans Supabase Dashboard, allez dans **Authentication** > **Settings**
2. Trouvez la section **Email Auth**
3. Assurez-vous que **Enable Email Confirmations** est **activé** (ON)

### 6. Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run web
```

## ✅ Vérification

Si tout est bien configuré :
- ✅ Pas d'erreur "Invalid API key"
- ✅ Vous pouvez créer un compte
- ✅ Vous recevez un email de confirmation
- ✅ Après validation, vous êtes redirigé vers l'app

## 🐛 Problèmes courants

### "Invalid API key" persiste

**Cause** : Le fichier `.env` n'est pas lu ou mal formaté

**Solutions** :
1. Vérifiez que le fichier s'appelle exactement `.env` (pas `.env.txt`)
2. Vérifiez qu'il n'y a pas d'espaces avant/après les `=`
3. Redémarrez complètement le serveur
4. Essayez : `npx expo start --clear` puis `npm run web`

### Email de confirmation non reçu

**Solutions** :
1. Vérifiez les spams
2. Vérifiez que "Enable Email Confirmations" est activé dans Supabase
3. Utilisez un vrai email (pas de email temporaire)

### Erreur lors de la migration SQL

**Cause** : La migration a déjà été exécutée ou il y a une erreur de syntaxe

**Solution** : Si c'est déjà exécuté, c'est normal. Vérifiez dans **Database** > **Tables** que les tables existent.

## 📞 Besoin d'aide ?

Consultez la documentation complète dans `docs/SUPABASE_SETUP.md`
