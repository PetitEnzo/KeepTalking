-- Migration: Création/Mise à jour de la table users_profiles
-- Cette table stocke les informations de profil utilisateur incluant le streak

-- 1. Créer la table users_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  current_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter current_streak si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profiles' AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;

  -- Ajouter last_activity_date si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profiles' AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN last_activity_date DATE;
  END IF;

  -- Ajouter username si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN username TEXT NOT NULL DEFAULT 'user';
  END IF;

  -- Ajouter avatar si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profiles' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN avatar TEXT DEFAULT '👤';
  END IF;
END $$;

-- 3. Activer Row Level Security (RLS)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour permettre aux utilisateurs de lire leur propre profil
DROP POLICY IF EXISTS "Users can read own profile" ON users_profiles;
CREATE POLICY "Users can read own profile" ON users_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
CREATE POLICY "Users can update own profile" ON users_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs d'insérer leur propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profiles;
CREATE POLICY "Users can insert own profile" ON users_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Créer un index sur id pour les performances
CREATE INDEX IF NOT EXISTS idx_users_profiles_id ON users_profiles(id);

-- 6. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer un trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_users_profiles_updated_at ON users_profiles;
CREATE TRIGGER update_users_profiles_updated_at
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vérification: Afficher la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users_profiles'
ORDER BY ordinal_position;
