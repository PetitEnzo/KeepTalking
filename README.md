# KeepTalking

Application d'apprentissage du **Langage français Parlé Complété (LfPC)** de type Duolingo, fonctionnant sur mobile (iOS/Android) et navigateur web avec un seul code.

## 🚀 Technologies

- **React Native + Expo** - Framework cross-platform
- **TypeScript** - Typage statique
- **Expo Router** - Navigation file-based
- **Supabase** - Backend (auth, database, storage)
- **NativeWind** - Styling avec Tailwind CSS
- **Jest + React Native Testing Library** - Tests

## 📋 Prérequis

- Node.js 18+ et npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Pour iOS : Xcode (macOS uniquement)
- Pour Android : Android Studio
- Compte Supabase (gratuit)

## 🛠️ Installation

```bash
# Aller dans le projet
cd keeptalking

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase
```

## 🎯 Commandes de base

### Développement

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur le web
npm run web

# Lancer sur iOS (macOS uniquement)
npm run ios

# Lancer sur Android
npm run android
```

### Tests

```bash
# Lancer les tests
npm test

# Vérification TypeScript
npm run type-check

# Linter
npm run lint
```

### Build

```bash
# Build pour le web
npx expo export:web

# Build pour iOS/Android
eas build --platform ios
eas build --platform android
```

## 📁 Structure du projet

```
/src
  /app          # Routes Expo Router
  /screens      # Écrans principaux
  /components   # Composants réutilisables
    /ui         # Composants UI de base
    /exercises  # Composants d'exercices
    /chat       # Composants de chat
  /services     # Services (Supabase, etc.)
  /contexts     # Contextes React
  /hooks        # Hooks personnalisés
  /utils        # Utilitaires
  /types        # Types TypeScript
  /constants    # Constantes
/docs           # Documentation
```

## 📖 Documentation

- [Guide d'installation](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Diagrammes](./docs/diagrams/)

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le [CHANGELOG](./CHANGELOG.md) pour voir l'historique des modifications.

## 📄 Licence

MIT
