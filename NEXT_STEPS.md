# Prochaines étapes

Le projet LfPC Learning App a été initialisé avec succès ! Voici les étapes à suivre pour le démarrer.

## ⚠️ Important : Installation de Node.js

**Node.js n'a pas été détecté sur votre système.** Vous devez l'installer avant de continuer.

### Installer Node.js

1. Téléchargez Node.js 18+ depuis [nodejs.org](https://nodejs.org/)
2. Installez la version LTS (Long Term Support)
3. Vérifiez l'installation :
   ```bash
   node --version
   npm --version
   ```

## 📦 Étape 1 : Installer les dépendances

Une fois Node.js installé, ouvrez un terminal dans le dossier du projet et exécutez :

```bash
cd C:\Users\enzop\CascadeProjects\lfpc-learning-app
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json`.

## 🔑 Étape 2 : Configurer Supabase

### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Notez l'URL du projet et la clé anonyme (anon key)

### Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
copy .env.example .env

# Éditer .env avec vos clés Supabase
notepad .env
```

Remplacez les valeurs par vos vraies clés :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

### Créer les tables dans Supabase

Consultez `docs/SETUP.md` pour les requêtes SQL à exécuter dans l'éditeur SQL de Supabase.

## 🎨 Étape 3 : Ajouter les assets

Créez ou ajoutez les images suivantes dans le dossier `assets/` :

- **icon.png** (1024x1024) - Icône de l'application
- **splash.png** (1242x2436) - Écran de démarrage
- **adaptive-icon.png** (1024x1024) - Icône Android
- **favicon.png** (48x48) - Favicon web

Pour le développement, vous pouvez utiliser des placeholders temporaires.

## 🚀 Étape 4 : Lancer l'application

### Sur navigateur web (recommandé pour commencer)

```bash
npm run web
```

L'application s'ouvrira dans votre navigateur à `http://localhost:19006`

### Sur mobile (simulateur/émulateur)

```bash
# iOS (macOS uniquement)
npm run ios

# Android
npm run android
```

### Sur appareil physique

1. Installez l'app **Expo Go** sur votre téléphone
2. Lancez `npm start`
3. Scannez le QR code

## 📝 Étape 5 : Définir votre workspace

Pour travailler efficacement sur ce projet dans votre IDE :

1. Ouvrez le dossier `C:\Users\enzop\CascadeProjects\lfpc-learning-app` comme workspace
2. Cela permettra une meilleure intégration avec TypeScript et les outils de développement

## ✅ Vérifications

Avant de commencer le développement, vérifiez que :

- [ ] Node.js est installé (`node --version`)
- [ ] Les dépendances sont installées (`npm install` terminé)
- [ ] Le fichier `.env` est configuré avec vos clés Supabase
- [ ] Les tables Supabase sont créées
- [ ] L'application démarre sans erreur (`npm run web`)

## 🐛 Résolution de problèmes

### Erreurs TypeScript

Les erreurs TypeScript actuelles sont normales car les dépendances ne sont pas encore installées. Elles disparaîtront après `npm install`.

### Erreur "Metro bundler not found"

```bash
npx expo start -c
```

### Problèmes de cache

```bash
rm -rf node_modules
npm install
npx expo start -c
```

## 📚 Documentation

- **README.md** - Vue d'ensemble du projet
- **docs/SETUP.md** - Guide d'installation détaillé
- **docs/ARCHITECTURE.md** - Architecture technique
- **CHANGELOG.md** - Historique des modifications

## 🎯 Développement

Une fois l'application lancée, vous pouvez commencer à développer :

1. **Authentification** - Implémenter les écrans de login/signup
2. **Exercices LfPC** - Créer les exercices interactifs
3. **Progression** - Système de suivi de progression
4. **Tests** - Ajouter les tests unitaires et d'intégration

Consultez le `CHANGELOG.md` pour voir tout ce qui a été mis en place.

Bon développement ! 🚀
