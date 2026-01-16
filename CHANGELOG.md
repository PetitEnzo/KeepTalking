# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Système de progression gamifié
- Exercices interactifs de reconnaissance LfPC
- Mode hors-ligne avec synchronisation
- Notifications push pour rappels d'apprentissage

## [0.1.0] - 2026-01-16

### Ajouté

#### Infrastructure
- Initialisation du projet Expo avec TypeScript
- Configuration du support web (React Native Web)
- Configuration de Expo Router pour la navigation file-based
- Intégration de Supabase (auth, database, storage)
- Configuration de NativeWind pour le styling cross-platform
- Configuration de Jest et React Native Testing Library

#### Authentification & Navigation
- **Système d'authentification Supabase complet** avec vérification email obligatoire
  - Contexte AuthContext avec signIn, signUp, signOut, resetPassword, checkEmailVerified
  - Écrans d'authentification : login, signup, verify-email, forgot-password
  - Composants UI réutilisables : TextInput, PasswordInput, AuthButton, PasswordStrengthIndicator, ErrorMessage
  - Routing conditionnel automatique basé sur l'état d'authentification
  - Gestion d'erreurs en français
  - Création automatique du profil utilisateur
  - Polling automatique pour la vérification email (5s)
  - Cooldown sur le renvoi d'email (60s)
- **Navigation avec Expo Router**
  - Groupe (auth) pour les écrans d'authentification
  - Groupe (tabs) pour l'application principale
  - 4 tabs : Accueil, Leçons, Progression, Profil
  - Redirection automatique selon l'état de session

#### Pages & Interface
- **Page de présentation About** (`/about`) avec design moderne et sobre
  - Refonte complète du style : palette élégante (Bleu #2563EB, Violet #7C3AED, Vert émeraude #10B981)
  - Retrait des références Duolingo pour un style unique et professionnel
  - Hero section avec logo et CTA principal
  - Section "Le Problème" avec 3 cartes de difficultés
  - Section "Notre Solution" avec gamification, micro-learning et chatbot
  - Section "Pour Qui ?" avec 3 personas (Parents, Professionnels, Étudiants)
  - Timeline "Comment ça marche ?" en 4 étapes
  - Grid 2x2 des fonctionnalités clés
  - Section Impact & Mission avec statistiques
  - CTA final avec boutons d'action
- Lien "À propos" ajouté sur la page d'accueil
- Utilisation des logos `logoColor.png` et `logoWhite&Black.png`

#### Base de données
- Création du schéma Supabase complet avec 4 tables :
  - `users` - Profils utilisateurs avec gamification
  - `lessons` - Leçons LfPC organisées par difficulté
  - `exercises` - Exercices individuels avec types variés
  - `user_progress` - Suivi de progression utilisateur
- Configuration Row Level Security (RLS) pour sécurité des données
- Triggers automatiques (création profil, timestamps)
- Migration SQL complète (`001_initial_schema.sql`)
- Données de seed avec 5 leçons et 11 exercices d'exemple

#### Structure du projet
- Création de la structure de dossiers complète :
  - `/src/app` - Routes Expo Router
  - `/src/screens` - Écrans principaux
  - `/src/components/ui` - Composants UI de base
  - `/src/components/exercises` - Composants d'exercices
  - `/src/components/chat` - Composants de chat
  - `/src/services` - Services (Supabase)
  - `/src/contexts` - Contextes React (Auth)
  - `/src/hooks` - Hooks personnalisés
  - `/src/utils` - Utilitaires
  - `/src/types` - Types TypeScript
  - `/src/constants` - Constantes
  - `/docs` - Documentation

#### Composants
- `Button` - Composant bouton avec variantes (primary, secondary, outline)
- `Card` - Composant carte pour conteneurs
- `ExerciseCard` - Carte d'exercice avec difficulté et type
- `ChatBubble` - Bulle de chat pour conversations
- `HomeScreen` - Écran d'accueil avec tableau de bord

#### Services & Contextes
- Configuration du client Supabase avec AsyncStorage
- `AuthContext` - Gestion de l'authentification (login, signup, logout)
- `useSupabase` - Hook pour requêtes Supabase simplifiées

#### Types
- Définition des types : `User`, `Exercise`, `ExerciseContent`, `Progress`, `Lesson`
- Types pour les niveaux de difficulté et types d'exercices

#### Utilitaires
- `formatDate` - Formatage de dates en français
- `calculateScore` - Calcul de scores
- `shuffleArray` - Mélange de tableaux
- `debounce` - Fonction de debounce

#### Configuration
- `package.json` avec toutes les dépendances
- `tsconfig.json` avec paths aliases (@/*)
- `tailwind.config.js` avec palette de couleurs personnalisée
- `babel.config.js` avec support NativeWind
- `metro.config.js` avec configuration NativeWind
- `jest.config.js` pour les tests
- `app.json` avec configuration Expo et support web
- `.gitignore` adapté pour Expo
- `.env.example` pour les variables d'environnement

#### Documentation
- `README.md` - Présentation du projet et commandes de base
- `docs/SETUP.md` - Guide d'installation détaillé avec configuration Supabase
- `docs/ARCHITECTURE.md` - Documentation de l'architecture technique (avec section Pages)
- `docs/DATABASE.md` - Documentation complète du schéma de base de données
- `docs/SUPABASE_SETUP.md` - Guide pas à pas pour configurer Supabase
- `docs/AUTHENTICATION.md` - Documentation complète du système d'authentification
- `docs/CONTENT.md` - Liste de tous les textes de l'application pour traduction future
- `docs/diagrams/system-architecture.mmd` - Diagramme Mermaid de l'architecture système

#### Scripts npm
- `start` - Démarrer le serveur de développement
- `web` - Lancer sur navigateur
- `ios` - Lancer sur iOS
- `android` - Lancer sur Android
- `test` - Lancer les tests
- `type-check` - Vérification TypeScript
- `lint` - Linter ESLint

### Notes techniques

- Support cross-platform confirmé (web + iOS + Android)
- Styling unifié avec NativeWind/Tailwind CSS
- Architecture modulaire et scalable
- Sécurité avec Row Level Security (RLS) Supabase
- Tests configurés mais à implémenter
- Prêt pour le développement des fonctionnalités

### Prochaines étapes

1. Installer les dépendances : `npm install`
2. Configurer Supabase et créer les tables
3. Ajouter les fichiers assets (icônes, splash screen)
4. Implémenter les écrans d'authentification
5. Développer les exercices LfPC
6. Ajouter les tests unitaires et d'intégration
