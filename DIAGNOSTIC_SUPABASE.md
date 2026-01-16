# 🔍 Diagnostic : Erreur "Invalid API key"

## Problème
L'application charge bien les clés Supabase (visible dans les logs), mais l'erreur "Invalid API key" apparaît lors de la création de compte.

## Causes possibles

### 1. ❌ Clé API incorrecte ou expirée
**Symptôme** : La clé est chargée mais rejetée par Supabase
**Solution** : Récupérer une nouvelle clé depuis le dashboard

### 2. ❌ Projet Supabase non configuré
**Symptôme** : Le projet existe mais n'est pas correctement initialisé
**Solution** : Vérifier la configuration du projet

### 3. ❌ Tables manquantes
**Symptôme** : La migration SQL n'a pas été exécutée
**Solution** : Exécuter la migration

## 🔧 Actions à faire MAINTENANT

### Étape 1 : Vérifier le projet Supabase

1. **Allez sur** [supabase.com](https://supabase.com)
2. **Connectez-vous** à votre compte
3. **Ouvrez votre projet** : `zpdnttetliljjpdtyofx`

### Étape 2 : Récupérer les VRAIES clés API

1. Dans le projet, cliquez sur **⚙️ Settings** (en bas à gauche)
2. Cliquez sur **API**
3. Vous verrez :

```
Project URL
https://zpdnttetliljjpdtyofx.supabase.co
```

```
Project API keys

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp...
[Bouton copier 📋]
```

4. **Cliquez sur le bouton copier** (📋) à côté de la clé `anon public`
5. **NE SÉLECTIONNEZ PAS LE TEXTE MANUELLEMENT**

### Étape 3 : Vérifier la clé actuelle

**Votre clé actuelle dans `.env` :**
```
seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZG50dGV0bGlsampwZHR5b2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjYwMDksImV4cCI6MjA4NDEwMjAwOX0.fVZqzvXOJ2SNweSGPm44kyCagGlVxm47kJvj-6vMrC0
```

⚠️ **ATTENTION** : Cette clé commence par `seyJ...` au lieu de `eyJ...`

**Le "s" au début est suspect !** Une clé JWT valide doit commencer par `eyJ`.

### Étape 4 : Corriger le fichier .env

**Ouvrez le fichier `.env` et vérifiez :**

1. La clé doit commencer par `eyJ` (pas `seyJ`)
2. Pas d'espace avant ou après
3. Tout sur une seule ligne

**Format correct :**
```env
EXPO_PUBLIC_SUPABASE_URL=https://zpdnttetliljjpdtyofx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZG50dGV0bGlsampwZHR5b2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMjE1NzAsImV4cCI6MjA1MjU5NzU3MH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Étape 5 : Vérifier que les tables existent

1. Dans Supabase Dashboard, cliquez sur **🗄️ Database**
2. Cliquez sur **Tables**
3. Vérifiez que vous voyez :
   - ✅ `users`
   - ✅ `lessons`
   - ✅ `exercises`
   - ✅ `user_progress`
   - ✅ `user_exercise_attempts`

**Si les tables n'existent pas :**
1. Cliquez sur **SQL Editor** (📝)
2. Cliquez sur **New query**
3. Ouvrez `supabase/migrations/001_initial_schema.sql`
4. Copiez TOUT le contenu
5. Collez dans l'éditeur SQL
6. Cliquez sur **Run**

### Étape 6 : Activer l'authentification email

1. Dans Supabase Dashboard, cliquez sur **🔐 Authentication**
2. Cliquez sur **Settings**
3. Vérifiez que **Enable Email Confirmations** est **ON**

### Étape 7 : Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C)
npm run web
```

## 🎯 Checklist de vérification

- [ ] Clé API commence par `eyJ` (pas `seyJ`)
- [ ] Clé copiée avec le bouton 📋 de Supabase (pas manuellement)
- [ ] Fichier `.env` sur 2 lignes uniquement
- [ ] Tables créées dans Supabase
- [ ] Email confirmations activées
- [ ] Application redémarrée

## 🐛 Si l'erreur persiste

Partagez une capture d'écran de :
1. La page **Settings > API** de Supabase (masquez la clé)
2. La console du navigateur (F12) avec l'erreur complète
