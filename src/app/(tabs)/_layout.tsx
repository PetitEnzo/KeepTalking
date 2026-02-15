import React, { useState, useEffect, useMemo } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, Text, Pressable, ScrollView, Image, StyleSheet, useWindowDimensions, Modal, TouchableWithoutFeedback, ImageBackground } from 'react-native';
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
  const { width } = useWindowDimensions();
  const [userAvatar, setUserAvatar] = useState<string>('👤');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    loadUserAvatar();
    checkAdminStatus();
    
    // Écouter les changements d'avatar
    const handleAvatarChange = () => {
      console.log('🔔 Événement avatarChanged reçu dans le sidebar');
      loadUserAvatar();
    };
    
    window.addEventListener('avatarChanged', handleAvatarChange);
    
    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange);
    };
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
    // Fermer la sidebar sur mobile et tablette après navigation
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path: string) => {
    if (path === '/(tabs)' || path === '/(tabs)/') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';
    }
    return pathname?.includes(path.replace('/(tabs)/', ''));
  };

  // Sidebar visible en permanence sur desktop, en modal sur mobile/tablette
  const SidebarContent = () => (
    <ImageBackground 
      source={require('../../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
      style={[
        styles.sidebar, 
        (isMobile || isTablet) && styles.sidebarMobile
      ]}
      imageStyle={styles.sidebarBackgroundImage}
      resizeMode="cover"
    >
        {/* Logo - Desktop only */}
        {!isMobile && !isTablet && (
          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/images/logoWhiteBlack.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

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

        {/* Close Button - Mobile/Tablet only */}
        {(isMobile || isTablet) && (
          <Pressable
            onPress={() => setIsSidebarOpen(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        )}

        {/* Navigation */}
        <View style={styles.navScroll}>
          {/* Groupe: Navigation principale */}
          <View style={styles.navGroup}>
            <Text style={styles.groupTitle}>NAVIGATION</Text>
            
            <Pressable 
              onPress={() => navigateTo('/(tabs)')}
              style={[styles.navItem, isActive('/(tabs)') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>🏠</Text>
              <Text style={[styles.navText, isActive('/(tabs)') && styles.navTextActive]}>Accueil</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/lessons')}
              style={[styles.navItem, isActive('/lessons') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>📚</Text>
              <Text style={[styles.navText, isActive('/lessons') && styles.navTextActive]}>Leçons</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/training-beginner')}
              style={[styles.navItem, isActive('/training-beginner') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>🖐️</Text>
              <Text style={[styles.navText, isActive('/training-beginner') && styles.navTextActive]}>Entraînement Débutant</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/training')}
              style={[styles.navItem, isActive('/training') && !isActive('/training-beginner') && !isActive('/training-expert') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>🎯</Text>
              <Text style={[styles.navText, isActive('/training') && !isActive('/training-beginner') && !isActive('/training-expert') && styles.navTextActive]}>Entraînement Avancé</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/training-expert')}
              style={[styles.navItem, isActive('/training-expert') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>🏆</Text>
              <Text style={[styles.navText, isActive('/training-expert') && styles.navTextActive]}>Entraînement Expert</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/contribute')}
              style={[styles.navItem, isActive('/contribute') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>✍️</Text>
              <Text style={[styles.navText, isActive('/contribute') && styles.navTextActive]}>Ajouter un mot</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/game')}
              style={[styles.navItem, isActive('/game') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>🎮</Text>
              <Text style={[styles.navText, isActive('/game') && styles.navTextActive]}>Jeu</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/basics')}
              style={[styles.navItem, isActive('/basics') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>📖</Text>
              <Text style={[styles.navText, isActive('/basics') && styles.navTextActive]}>Les bases du code</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigateTo('/(tabs)/profile')}
              style={[styles.navItem, isActive('/profile') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
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
              style={[styles.navItem, isActive('/about') && styles.navItemActive]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.navIcon}>ℹ️</Text>
              <Text style={[styles.navText, isActive('/about') && styles.navTextActive]}>À propos</Text>
            </Pressable>

            {isAdmin && (
              <Pressable 
                onPress={() => navigateTo('/(tabs)/admin')}
                style={[styles.navItem, isActive('/admin') && styles.navItemActive]}
                android_ripple={{ color: 'transparent' }}
              >
                <Text style={styles.navIcon}>🛡️</Text>
                <Text style={[styles.navText, isActive('/admin') && styles.navTextActive]}>Administration</Text>
              </Pressable>
            )}
          </View>

          {/* Theme Toggle */}
          <View style={styles.themeSection}>
            <Pressable 
              onPress={toggleTheme}
              style={styles.themeToggleContainer}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={[
                styles.themeToggle,
                theme === 'dark' && styles.themeToggleDark
              ]}>
                <View style={[
                  styles.themeToggleCircle,
                  theme === 'dark' && styles.themeToggleCircleDark
                ]}>
                  <Text style={styles.themeToggleIcon}>
                    {theme === 'light' ? '☀️' : '🌙'}
                  </Text>
                </View>
                <Text style={[
                  styles.themeToggleText,
                  theme === 'dark' && styles.themeToggleTextDark
                ]}>
                  {theme === 'light' ? 'MODE CLAIR' : 'MODE SOMBRE'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Sign Out */}
          <View style={styles.signOutSection}>
            <Pressable 
              onPress={handleSignOut}
              style={styles.signOutButton}
              android_ripple={{ color: 'transparent' }}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
  );

  return (
    <View style={[styles.container, (isMobile || isTablet) && styles.containerMobile]}>
      {/* Bandeau menu pour mobile/tablette */}
      {(isMobile || isTablet) && (
        <Pressable 
          style={styles.mobileMenuBar}
          onPress={toggleSidebar}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
          <Text style={styles.mobileMenuTitle}>Menu</Text>
        </Pressable>
      )}

      {/* Sidebar - Desktop: always visible, Mobile/Tablet: modal */}
      {isMobile || isTablet ? (
        <Modal
          visible={isSidebarOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsSidebarOpen(false)}
        >
          <View style={styles.fullScreenModal}>
            <SidebarContent />
          </View>
        </Modal>
      ) : (
        <SidebarContent />
      )}

      {/* Main Content */}
      <View style={[styles.mainContent, (isMobile || isTablet) && styles.mainContentFullWidth]}>
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
  containerMobile: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 288,
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  sidebarBackgroundImage: {
    opacity: 1,
  },
  logoSection: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
    paddingLeft: 24,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  email: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  navScroll: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  navGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
    // @ts-ignore
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  navItemPressed: {
    backgroundColor: 'transparent',
    opacity: 1,
  },
  navItemHovered: {
    backgroundColor: 'transparent',
    opacity: 1,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  themeSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  themeToggleContainer: {
    alignItems: 'center',
  },
  themeToggle: {
    width: 200,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'relative',
  },
  themeToggleDark: {
    backgroundColor: '#1F2937',
    justifyContent: 'flex-end',
  },
  themeToggleCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    position: 'absolute',
    left: 8,
  },
  themeToggleCircleDark: {
    left: 148,
    borderColor: '#374151',
  },
  themeToggleIcon: {
    fontSize: 20,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 60,
  },
  themeToggleTextDark: {
    color: '#FFFFFF',
    marginLeft: 12,
    marginRight: 60,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mainContent: {
    flex: 1,
  },
  mainContentFullWidth: {
    width: '100%',
    paddingTop: 0,
  },
  sidebarMobile: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  hamburgerContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10000,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  hamburgerButtonPressed: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 0.95 }],
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mobileMenuBar: {
    width: '100%',
    height: 56,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  mobileMenuTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalSidebar: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
  },
});
