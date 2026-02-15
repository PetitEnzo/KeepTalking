import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/auth/AuthButton';
import { ErrorMessage } from '../../components/auth/ErrorMessage';

export default function VerifyEmailScreen() {
  const { user, checkEmailVerified, resendVerificationEmail } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (checkEmailVerified()) {
        // Redirection vers la homepage après validation
        router.replace('/(tabs)');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkEmailVerified, router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    setError('');
    setSuccess('');
    
    try {
      await resendVerificationEmail();
      setSuccess('Email de vérification renvoyé avec succès');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi de l\'email');
    }
  };

  const handleChangeEmail = () => {
    router.back();
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>📧</Text>
              </View>
            </View>
            
            {/* Title */}
            <Text style={styles.title}>
              Vérifiez votre email
            </Text>
            
            <Text style={styles.emailText}>
              {user?.email}
            </Text>
            
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Cliquez sur le lien dans l'email pour activer votre compte.
                {'\n\n'}
                Pensez à vérifier vos spams si vous ne le trouvez pas.
              </Text>
            </View>

            {/* Error/Success Messages */}
            <ErrorMessage message={error} />
            {success && (
              <View style={styles.successBox}>
                <View style={styles.successContent}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successText}>
                    {success}
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <AuthButton
                title={cooldown > 0 ? `Renvoyer l'email (${cooldown}s)` : "Renvoyer l'email"}
                onPress={handleResendEmail}
                disabled={cooldown > 0}
                variant="primary"
              />

              <View style={styles.buttonSpacing} />

              <AuthButton
                title="Changer d'email"
                onPress={handleChangeEmail}
                variant="secondary"
              />
            </View>

            {/* Info */}
            <Text style={styles.footerText}>
              La vérification peut prendre quelques minutes.
              {'\n'}
              Cette page se rafraîchit automatiquement.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#DBEAFE',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoText: {
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 15,
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  successText: {
    flex: 1,
    color: '#15803D',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  buttonSpacing: {
    height: 16,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
