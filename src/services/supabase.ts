import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug: Vérifier que les clés sont chargées
console.log('🔑 Supabase URL:', supabaseUrl ? '✅ Chargée' : '❌ MANQUANTE');
console.log('🔑 Supabase Anon Key:', supabaseAnonKey ? '✅ Chargée' : '❌ MANQUANTE');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERREUR: Les clés Supabase ne sont pas configurées dans le fichier .env');
  console.error('Créez un fichier .env à la racine avec:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon');
}

// Utiliser localStorage pour web, AsyncStorage pour mobile
const storage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
