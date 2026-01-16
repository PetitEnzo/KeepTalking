import React, { useState } from 'react';
import { View, Text, Image, Pressable, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { TextInput } from '../../components/auth/TextInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { ErrorMessage } from '../../components/auth/ErrorMessage';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          
          <Text style={styles.successTitle}>
            Email envoyé !
          </Text>
          
          <Text style={styles.successText}>
            Un lien de réinitialisation a été envoyé à :
            {'\n\n'}
            <Text style={styles.successEmail}>{email}</Text>
          </Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
              {'\n\n'}
              Le lien expire dans 1 heure.
            </Text>
          </View>
        </View>

        <AuthButton
          title="Retour à la connexion"
          onPress={() => router.replace('/(auth)/login')}
          variant="primary"
        />
      </View>
    );
  }

  return (
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
          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/images/logoWhiteBlack.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>
              Mot de passe oublié ?
            </Text>
            <Text style={styles.subtitle}>
              Entrez votre email pour recevoir un lien
            </Text>
          </View>

          {/* Error Message */}
          <ErrorMessage message={error} />

          {/* Form */}
          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <AuthButton
              title="Envoyer le lien"
              onPress={handleResetPassword}
              loading={loading}
              variant="primary"
            />
          </View>

          {/* Back to Login */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              ← Retour à la connexion
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 100,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  successIcon: {
    width: 128,
    height: 128,
    backgroundColor: '#D1FAE5',
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  successEmail: {
    fontWeight: 'bold',
    color: '#2563EB',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  infoText: {
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
});
