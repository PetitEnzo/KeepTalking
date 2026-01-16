# Architecture - LfPC Learning App

## 🏗️ Vue d'ensemble

L'application LfPC Learning est une application cross-platform (web + mobile) construite avec React Native et Expo, permettant l'apprentissage du Langage français Parlé Complété.

## 📚 Stack technique

### Frontend

- **React Native** `0.76.5` - Framework mobile
- **React** `18.3.1` - Bibliothèque UI
- **React Native Web** `0.19.13` - Support web
- **TypeScript** `5.3.3` - Typage statique
- **Expo** `~52.0.0` - Toolchain et SDK
- **Expo Router** `~4.0.0` - Navigation file-based

### Styling

- **NativeWind** `4.0.1` - Tailwind CSS pour React Native
- **Tailwind CSS** `3.4.1` - Framework CSS utility-first

### Backend & Services

- **Supabase** `2.39.0` - Backend as a Service
  - **PostgreSQL** - Base de données relationnelle
  - **Auth** - Authentification et gestion des utilisateurs
  - **Storage** - Stockage de fichiers
  - **Row Level Security** - Sécurité au niveau des lignes

### État & Données

- **React Context API** - Gestion d'état globale
- **AsyncStorage** - Stockage local persistant
- **Expo Secure Store** - Stockage sécurisé (tokens, etc.)

### Tests

- **Jest** `29.7.0` - Framework de tests
- **React Native Testing Library** `12.4.3` - Tests de composants
- **Jest Native** `5.4.3` - Matchers supplémentaires

## 📁 Structure des dossiers

```
lfpc-learning-app/
├── src/
│   ├── app/                    # Routes Expo Router (file-based routing)
│   │   ├── _layout.tsx         # Layout racine
│   │   ├── index.tsx           # Page d'accueil
│   │   └── about.tsx           # Page de présentation / Landing page
│   │
│   ├── screens/                # Écrans principaux de l'application
│   │   └── HomeScreen.tsx      # Écran d'accueil
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants UI de base
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── exercises/          # Composants liés aux exercices
│   │   │   └── ExerciseCard.tsx
│   │   └── chat/               # Composants de chat/conversation
│   │       └── ChatBubble.tsx
│   │
│   ├── services/               # Services externes
│   │   └── supabase.ts         # Client Supabase
│   │
│   ├── contexts/               # Contextes React
│   │   └── AuthContext.tsx     # Contexte d'authentification
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   └── useSupabase.ts      # Hook pour requêtes Supabase
│   │
│   ├── utils/                  # Fonctions utilitaires
│   │   └── helpers.ts          # Helpers généraux
│   │
│   ├── types/                  # Types TypeScript
│   │   └── index.ts            # Types globaux
│   │
│   ├── constants/              # Constantes
│   │   └── index.ts            # Constantes globales
│   │
│   └── styles/                 # Styles globaux
│       └── global.css          # CSS global (Tailwind)
│
├── docs/                       # Documentation
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── diagrams/
│   │   └── system-architecture.mmd
│   └── personas/
│
├── assets/                     # Assets statiques
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
│
├── app.json                    # Configuration Expo
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── jest.config.js
└── .env.example
```

## 📄 Pages

### Page d'accueil (`/` - index.tsx)

Page d'entrée minimaliste avec :
- Logo et titre KeepTalking
- Bouton "Commencer" (CTA principal)
- Bouton "Connexion"
- Lien vers la page "À propos"

### Page About (`/about` - about.tsx)

Landing page complète et engageante présentant l'application. Design moderne inspiré de Duolingo.

**Sections :**

1. **Hero Section** - Accroche principale avec logo, titre, sous-titre et CTA
2. **Le Problème** - Contexte du LfPC et difficultés actuelles (3 cartes)
3. **Notre Solution** - Fonctionnalités principales (Gamification, Micro-learning, Chatbot)
4. **Pour Qui ?** - 3 personas cibles avec témoignages :
   - Parents engagés
   - Orthophonistes & éducateurs
   - Étudiants motivés
5. **Comment ça marche ?** - Timeline en 4 étapes
6. **Fonctionnalités clés** - Grid 2x2 des features principales
7. **Impact & Mission** - Vision et statistiques
8. **CTA Final** - Appel à l'action avec boutons

**Design :**
- Palette moderne et sobre : Bleu (#2563EB), Violet (#7C3AED), Vert émeraude (#10B981)
- Style épuré avec borders subtiles et shadows légères
- Responsive : Mobile-first avec breakpoints MD/LG
- Animations : Hover effects, transitions douces
- Espacement généreux et whitespace
- Utilise les logos `logoColor.png` et `logoWhite&Black.png`
- Typographie : Slate pour les textes (900, 600, 500)

## 🔄 Flux de données

### Authentification

```
User Action → AuthContext → Supabase Auth → Session Update → UI Update
```

1. L'utilisateur effectue une action (login, signup, logout)
2. Le `AuthContext` appelle les méthodes Supabase appropriées
3. Supabase gère l'authentification et retourne une session
4. Le contexte met à jour l'état global
5. Les composants réagissent aux changements d'état

### Récupération de données

```
Component → useSupabase Hook → Supabase Client → PostgreSQL → Data Return
```

1. Un composant utilise le hook `useSupabase`
2. Le hook effectue une requête via le client Supabase
3. Supabase interroge PostgreSQL avec RLS
4. Les données sont retournées et mises en cache localement
5. Le composant se met à jour avec les nouvelles données

## 🌐 Stratégie cross-platform (Web + Mobile)

### Approche "Write Once, Run Anywhere"

L'application utilise une base de code unique pour toutes les plateformes grâce à :

#### 1. React Native Web

- Compile les composants React Native en HTML/CSS/JS
- Permet l'utilisation des mêmes composants sur web et mobile
- Gestion automatique des différences de plateforme

#### 2. NativeWind

- Styling unifié avec Tailwind CSS
- Classes CSS identiques sur toutes les plateformes
- Compilation optimisée pour chaque plateforme

#### 3. Expo Router

- Routing file-based fonctionnant sur web et mobile
- Navigation native sur mobile, URLs sur web
- Deep linking automatique

### Différences par plateforme

Lorsque nécessaire, utiliser `Platform.select()` :

```typescript
import { Platform } from 'react-native';

const styles = Platform.select({
  web: { cursor: 'pointer' },
  ios: { shadowOpacity: 0.3 },
  android: { elevation: 4 },
});
```

### Gestion du responsive

NativeWind permet d'utiliser les breakpoints Tailwind :

```tsx
<View className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive sur toutes les plateformes */}
</View>
```

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables Supabase utilisent RLS pour garantir que :
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les requêtes sont automatiquement filtrées côté serveur
- Aucune donnée sensible n'est exposée

### Stockage sécurisé

- **Tokens d'authentification** : Expo Secure Store (chiffré)
- **Données de session** : AsyncStorage
- **Variables d'environnement** : Préfixe `EXPO_PUBLIC_` pour exposition contrôlée

### Validation

- Validation côté client avec TypeScript
- Validation côté serveur avec PostgreSQL constraints
- Sanitisation des entrées utilisateur

## 🧪 Architecture de tests

### Tests unitaires

```typescript
// Composants UI
describe('Button', () => {
  it('should render correctly', () => {
    // Test
  });
});
```

### Tests d'intégration

```typescript
// Flux complets
describe('Authentication Flow', () => {
  it('should login user successfully', () => {
    // Test
  });
});
```

### Structure des tests

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
```

## 🚀 Performance

### Optimisations

1. **Code Splitting** - Chargement lazy des routes
2. **Memoization** - `React.memo()`, `useMemo()`, `useCallback()`
3. **Virtualisation** - `FlatList` pour les longues listes
4. **Images optimisées** - Compression et formats adaptés
5. **Cache Supabase** - Mise en cache des requêtes fréquentes

### Métriques

- **Time to Interactive (TTI)** < 3s sur web
- **First Contentful Paint (FCP)** < 1.5s
- **Bundle size** < 500KB (web, gzipped)

## 🔄 CI/CD

### Pipeline recommandé

1. **Lint & Type Check** - Vérification du code
2. **Tests** - Exécution de la suite de tests
3. **Build** - Compilation pour chaque plateforme
4. **Deploy** - Déploiement automatique

### Outils suggérés

- **GitHub Actions** - CI/CD
- **EAS Build** - Build iOS/Android
- **Vercel/Netlify** - Déploiement web

## 📊 Monitoring

### Outils recommandés

- **Sentry** - Tracking d'erreurs
- **Analytics** - Expo Analytics ou Google Analytics
- **Performance** - React Native Performance Monitor

## 🔮 Évolutions futures

### Fonctionnalités prévues

- Mode hors-ligne avec synchronisation
- Notifications push
- Gamification avancée
- Reconnaissance vocale
- Vidéos LfPC interactives
- Communauté et forums

### Améliorations techniques

- Migration vers Expo SDK 53+
- Implémentation de React Server Components
- Optimisation des animations avec Reanimated
- Ajout de Storybook pour la documentation des composants
