import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailVerified: () => boolean;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Veuillez confirmer votre email avant de vous connecter');
      }
      throw new Error(error.message);
    }
    
    // Vérifier si l'email est confirmé
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Veuillez confirmer votre email avant de vous connecter');
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('🔵 Début de l\'inscription pour:', email, 'username:', username);
    
    // Inscription avec métadonnées
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: undefined, // Pas de redirection auto
      },
    });
    
    if (error) {
      console.error('❌ Erreur auth.signUp:', error);
      if (error.message.includes('already registered')) {
        throw new Error('Cet email est déjà utilisé');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }
      throw new Error(error.message);
    }
    
    console.log('✅ Compte auth créé, user ID:', data.user?.id);
    
    // Créer le profil utilisateur dans la table users
    if (data.user) {
      console.log('🔵 Insertion dans users avec:', {
        auth_user_id: data.user.id,
        username,
        current_streak: 0,
        total_points: 0,
        level: 1,
      });
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: data.user.id,
          username,
          current_streak: 0,
          total_points: 0,
          level: 1,
        });
      
      if (profileError) {
        console.error('❌ Erreur création profil:', profileError);
        throw new Error('Database error saving new user');
      }
      
      console.log('✅ Profil utilisateur créé avec succès');
      
      // Créer le profil users_profiles avec un avatar aléatoire
      const avatarOptions = ['bunnyprfp', 'dogprfp', 'dog2prfp', 'koalaprfp', 'loutreprfp', 'paresseuxprfp', 'pdarouxprfp', 'soincprfp'];
      const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
      
      console.log('🔵 Création du profil users_profiles avec avatar:', randomAvatar);
      
      const { error: usersProfilesError } = await supabase
        .from('users_profiles')
        .insert({
          id: data.user.id,
          username,
          avatar: randomAvatar,
        });
      
      if (usersProfilesError) {
        console.error('❌ Erreur création users_profiles:', usersProfilesError);
        // Ne pas bloquer l'inscription si cette table échoue
      } else {
        console.log('✅ Profil users_profiles créé avec avatar aléatoire');
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Erreur lors de la déconnexion');
    }
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    
    if (error) {
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  };
  
  const checkEmailVerified = (): boolean => {
    return user?.email_confirmed_at != null;
  };
  
  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('Aucun email associé');
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    
    if (error) {
      throw new Error('Erreur lors du renvoi de l\'email de vérification');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        resetPassword, 
        checkEmailVerified, 
        resendVerificationEmail 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
