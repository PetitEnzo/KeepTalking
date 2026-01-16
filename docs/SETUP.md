# Guide d'installation - LfPC Learning App

## 📦 Installation des dépendances

### 1. Installer Node.js

Téléchargez et installez Node.js 18+ depuis [nodejs.org](https://nodejs.org/)

Vérifiez l'installation :
```bash
node --version
npm --version
```

### 2. Installer Expo CLI

```bash
npm install -g expo-cli
```

### 3. Installer les dépendances du projet

```bash
cd lfpc-learning-app
npm install
```

## 🔑 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Notez l'URL du projet et la clé anonyme (anon key)

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

### 3. Créer les tables dans Supabase

Connectez-vous à votre projet Supabase et exécutez ces requêtes SQL :

```sql
-- Table des utilisateurs (profils)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des leçons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exercices
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  type TEXT NOT NULL CHECK (type IN ('recognition', 'production', 'comprehension')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de progression
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  exercise_id UUID REFERENCES exercises(id),
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Activer Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own progress" 
  ON progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
  ON progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON progress FOR UPDATE 
  USING (auth.uid() = user_id);
```

## 🚀 Lancement du projet

### Développement Web

```bash
npm run web
```

L'application s'ouvrira dans votre navigateur à `http://localhost:19006`

### Développement Mobile

#### Sur simulateur/émulateur

```bash
# iOS (macOS uniquement)
npm run ios

# Android
npm run android
```

#### Sur appareil physique

1. Installez l'app **Expo Go** sur votre téléphone
2. Lancez `npm start`
3. Scannez le QR code avec :
   - iOS : Appareil photo
   - Android : App Expo Go

## 🧪 Tests

### Lancer les tests

```bash
npm test
```

### Vérifier le typage TypeScript

```bash
npm run type-check
```

### Linter

```bash
npm run lint
```

## 🔧 Commandes utiles

### Nettoyer le cache

```bash
npx expo start -c
```

### Mettre à jour les dépendances Expo

```bash
npx expo install --fix
```

### Générer les types de routes

```bash
npx expo customize tsconfig.json
```

## 📱 Build de production

### Configuration EAS (Expo Application Services)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login

# Configurer le projet
eas build:configure
```

### Build iOS

```bash
eas build --platform ios
```

### Build Android

```bash
eas build --platform android
```

### Build Web

```bash
npx expo export:web
```

Les fichiers statiques seront générés dans `dist/`

## ⚠️ Problèmes courants

### Erreur "Metro bundler not found"

```bash
npx expo start -c
```

### Erreur de cache

```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Problèmes de dépendances

```bash
npx expo install --fix
```

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation NativeWind](https://www.nativewind.dev/)
- [Documentation Expo Router](https://docs.expo.dev/router/introduction/)
