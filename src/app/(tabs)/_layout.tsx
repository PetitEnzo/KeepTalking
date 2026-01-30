import { useState, useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';

// Fonction pour vérifier si c'est une image ou un emoji
const isImageAvatar = (avatar: string) => {
  return avatar && (avatar.includes('prfp') || avatar.startsWith('avatar') || avatar.includes('.png') || avatar.includes('.jpg'));
};

// Fonction pour obtenir la source de l'image
const getAvatarImageSource = (avatarId: string) => {
  try {
    switch(avatarId) {
      case 'bunnyprfp':
        return require('../../../assets/images/profile_pictures/bunnyprfp.jpg');
      case 'dogprfp':
        return require('../../../assets/images/profile_pictures/dogprfp.jpg');
      case 'dog2prfp':
        return require('../../../assets/images/profile_pictures/dog2prfp.jpg');
      case 'koalaprfp':
        return require('../../../assets/images/profile_pictures/koalaprfp.jpg');
      case 'loutreprfp':
        return require('../../../assets/images/profile_pictures/loutreprfp.jpg');
      case 'paresseuxprfp':
        return require('../../../assets/images/profile_pictures/paresseuxprfp.jpg');
      case 'pdarouxprfp':
        return require('../../../assets/images/profile_pictures/pdarouxprfp.jpg');
      case 'soincprfp':
        return require('../../../assets/images/profile_pictures/soincprfp.jpg');
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
};

export default function TabsLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [userAvatar, setUserAvatar] = useState<string>('👤');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserAvatar();
    checkAdminStatus();
    
    // Rafraîchir l'avatar toutes les 2 secondes pour détecter les changements
    const interval = setInterval(() => {
      loadUserAvatar();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const loadUserAvatar = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('avatar')
        .eq('id', user.id)
        .single();

      if (!error && data?.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.log('Erreur lors du chargement de l\'avatar:', error);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.log('Erreur lors de la vérification du rôle:', error);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const isActive = (path: string) => {
    if (path === '/(tabs)' || path === '/(tabs)/') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';
    }
    return pathname?.includes(path.replace('/(tabs)/', ''));
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/images/logoWhiteBlack.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {isImageAvatar(userAvatar) && getAvatarImageSource(userAvatar) ? (
                <Image 
                  source={getAvatarImageSource(userAvatar)} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userAvatar || user?.user_metadata?.username?.[0]?.toUpperCase() || '👤'}
                </Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>
                {user?.user_metadata?.username || 'Utilisateur'}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <ScrollView style={styles.navScroll}>
          {/* Groupe: Navigation principale */}
          <View style={styles.navGroup}>
            <Text style={styles.groupTitle}>NAVIGATION</Text>
            
            <Pressable 
              onPress={() => navigateTo('/(tabs)')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/(tabs)') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>🏠</Text>
              <Text style={[styles.navText, isActive('/(tabs)') && styles.navTextActive]}>Accueil</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/lessons')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/lessons') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>📚</Text>
              <Text style={[styles.navText, isActive('/lessons') && styles.navTextActive]}>Leçons</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/training-beginner')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/training-beginner') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>🖐️</Text>
              <Text style={[styles.navText, isActive('/training-beginner') && styles.navTextActive]}>Entraînement Débutant</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/training')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/training') && !isActive('/training-beginner') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>🎯</Text>
              <Text style={[styles.navText, isActive('/training') && !isActive('/training-beginner') && styles.navTextActive]}>Entraînement Avancé</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/contribute')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/contribute') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>✍️</Text>
              <Text style={[styles.navText, isActive('/contribute') && styles.navTextActive]}>Ajouter un mot</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/game')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/game') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>🎮</Text>
              <Text style={[styles.navText, isActive('/game') && styles.navTextActive]}>Jeu</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/basics')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/basics') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>📖</Text>
              <Text style={[styles.navText, isActive('/basics') && styles.navTextActive]}>Les bases du code</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/profile')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/profile') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>👤</Text>
              <Text style={[styles.navText, isActive('/profile') && styles.navTextActive]}>Profil</Text>
            </Pressable>
          </View>

          {/* Groupe: Informations */}
          <View style={styles.navGroup}>
            <Text style={styles.groupTitle}>INFORMATIONS</Text>
            
            <Pressable 
              onPress={() => navigateTo('/(tabs)/about')}
              style={({ pressed }) => [
                styles.navItem, 
                pressed && styles.navItemPressed,
                isActive('/about') && styles.navItemActive
              ]}
            >
              <Text style={styles.navIcon}>ℹ️</Text>
              <Text style={[styles.navText, isActive('/about') && styles.navTextActive]}>À propos</Text>
            </Pressable>

            {isAdmin && (
              <Pressable 
                onPress={() => navigateTo('/(tabs)/admin')}
                style={({ pressed }) => [
                  styles.navItem, 
                  pressed && styles.navItemPressed,
                  isActive('/admin') && styles.navItemActive
                ]}
              >
                <Text style={styles.navIcon}>🛡️</Text>
                <Text style={[styles.navText, isActive('/admin') && styles.navTextActive]}>Administration</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* Theme Toggle */}
        <View style={styles.themeSection}>
          <Pressable 
            onPress={toggleTheme}
            style={({ pressed }) => [styles.themeButton, pressed && styles.themeButtonPressed]}
          >
            <Text style={styles.themeIcon}>{theme === 'light' ? '🌙' : '☀️'}</Text>
            <Text style={styles.themeText}>
              {theme === 'light' ? 'Mode nuit' : 'Mode jour'}
            </Text>
          </Pressable>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Pressable 
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
          >
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="lessons" />
          <Stack.Screen name="training" />
          <Stack.Screen name="contribute" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="about" />
          <Stack.Screen name="admin" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },
  sidebar: {
    width: 288,
    backgroundColor: '#0F172A',
    flexDirection: 'column',
  },
  logoSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
  email: {
    fontSize: 12,
    color: '#94A3B8',
  },
  navScroll: {
    flex: 1,
    padding: 16,
  },
  navGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  navItemPressed: {
    backgroundColor: '#1E293B',
  },
  navItemActive: {
    backgroundColor: '#2563EB',
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  navTextActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  navText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  themeSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  themeButton: {
    backgroundColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonPressed: {
    backgroundColor: '#334155',
  },
  themeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  themeText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  signOutSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  signOutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
  },
});
