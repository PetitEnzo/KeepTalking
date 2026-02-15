import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { TamaguiProvider } from '@tamagui/core';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import tamaguiConfig from '../../tamagui.config';
import '../../global.css';

function RootLayoutNav() {
  const { user, loading, checkEmailVerified } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isPublicPage = segments.length === 0 || segments[0] === 'about' || segments[0] === 'privacy' || segments[0] === 'terms';

    // Permettre l'accès aux pages publiques (index, about, privacy, terms) et aux tabs (mode invité)
    if (isPublicPage || inTabsGroup) {
      return;
    }

    if (!user && !inAuthGroup) {
      // Utilisateur non connecté et pas dans le groupe auth -> rediriger vers login
      router.replace('/(auth)/login');
    } else if (user && !checkEmailVerified() && segments[1] !== 'verify-email') {
      // Utilisateur connecté mais email non vérifié -> rediriger vers verify-email
      router.replace('/(auth)/verify-email');
    } else if (user && checkEmailVerified() && !inTabsGroup) {
      // Utilisateur connecté et email vérifié -> rediriger vers l'app
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
