import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
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
  const [userAvatar, setUserAvatar] = useState<string>('👤');

  useEffect(() => {
    loadUserAvatar();
    
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

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
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
          <Text style={styles.appTitle}>KeepTalking</Text>
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
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>🏠</Text>
              <Text style={styles.navText}>Accueil</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/lessons')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>📚</Text>
              <Text style={styles.navText}>Leçons</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/game')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>🎮</Text>
              <Text style={styles.navText}>Jeu</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/basics')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>📖</Text>
              <Text style={styles.navText}>Les bases du code</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/chat')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>💬</Text>
              <Text style={styles.navText}>Chat</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/profile')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>👤</Text>
              <Text style={styles.navText}>Profil</Text>
            </Pressable>
          </View>

          {/* Groupe: Informations */}
          <View style={styles.navGroup}>
            <Text style={styles.groupTitle}>INFORMATIONS</Text>
            
            <Pressable 
              onPress={() => navigateTo('/(tabs)/about')}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
            >
              <Text style={styles.navIcon}>ℹ️</Text>
              <Text style={styles.navText}>À propos</Text>
            </Pressable>
          </View>
        </ScrollView>

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
          <Stack.Screen name="chat" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="about" />
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
    width: 120,
    height: 120,
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
  navIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  navText: {
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
