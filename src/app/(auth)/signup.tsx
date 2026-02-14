import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { TextInput } from '../../components/auth/TextInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { ErrorMessage } from '../../components/auth/ErrorMessage';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères');
      return false;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, username);
      router.push('/(auth)/verify-email');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.backgroundImage}>
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logoColor.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Créer un compte
            </Text>
            <Text style={styles.subtitle}>Rejoignez KeepTalking</Text>
          </View>

          {/* Error Message */}
          <ErrorMessage message={error} />

          {/* Form Group */}
          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Nom d'utilisateur"
                placeholder="johndoe"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

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

            <View style={styles.inputWrapper}>
              <PasswordInput
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                autoComplete="password-new"
              />
            </View>

            <PasswordStrengthIndicator password={password} />

            <View style={styles.inputWrapper}>
              <PasswordInput
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="password-new"
              />
            </View>
          </View>

          {/* Terms Checkbox Group */}
          <View style={styles.termsContainer}>
            <View style={styles.termsCheckbox}>
              <Pressable 
                onPress={() => setAcceptTerms(!acceptTerms)}
                style={({ pressed }) => [
                  styles.checkboxPressable,
                  pressed && styles.termsCheckboxPressed
                ]}
              >
                <View style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked
                ]}>
                  {acceptTerms && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
              </Pressable>
              <Text style={styles.termsText}>
                J'accepte les{' '}
                <Link href="/terms" asChild>
                  <Pressable>
                    <Text style={styles.termsLink}>
                      conditions d'utilisation
                    </Text>
                  </Pressable>
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" asChild>
                  <Pressable>
                    <Text style={styles.termsLink}>
                      politique de confidentialité
                    </Text>
                  </Pressable>
                </Link>
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <AuthButton
              title="Créer mon compte"
              onPress={handleSignUp}
              loading={loading}
              variant="primary"
              disabled={!acceptTerms}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Pressable 
                onPress={() => router.push('/(auth)/login')}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed
                ]}
              >
                <Text style={styles.loginText}>
                  Déjà un compte ?{' '}
                  <Text style={styles.loginLink}>
                    Se connecter
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
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
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  termsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxPressable: {
    marginRight: 12,
  },
  termsCheckboxPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 24,
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    gap: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
  },
  loginButtonPressed: {
    backgroundColor: '#E2E8F0',
  },
  loginText: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
