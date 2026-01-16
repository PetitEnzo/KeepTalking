import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
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
    <View className="flex-1 bg-white px-6 py-12 justify-center">
      <View className="items-center mb-12">
        <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center mb-6">
          <Text className="text-6xl">📧</Text>
        </View>
        
        <Text className="text-3xl font-bold text-slate-900 text-center mb-4">
          Vérifiez votre email
        </Text>
        
        <Text className="text-lg text-slate-600 text-center mb-2">
          Un email de confirmation vous a été envoyé à :
        </Text>
        
        <Text className="text-lg font-bold text-blue-600 text-center mb-8">
          {user?.email}
        </Text>
        
        <View className="bg-slate-50 rounded-2xl p-6 mb-8">
          <Text className="text-slate-700 text-center leading-relaxed">
            Cliquez sur le lien dans l'email pour activer votre compte.
            {'\n\n'}
            Pensez à vérifier vos spams si vous ne le trouvez pas.
          </Text>
        </View>
      </View>

      {/* Error/Success Messages */}
      <ErrorMessage message={error} />
      {success && (
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">✅</Text>
            <Text className="flex-1 text-green-700 font-medium">
              {success}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View className="space-y-4">
        <AuthButton
          title={cooldown > 0 ? `Renvoyer l'email (${cooldown}s)` : "Renvoyer l'email"}
          onPress={handleResendEmail}
          disabled={cooldown > 0}
          variant="primary"
        />

        <AuthButton
          title="Changer d'email"
          onPress={handleChangeEmail}
          variant="secondary"
        />
      </View>

      {/* Info */}
      <Text className="text-slate-500 text-sm text-center mt-8">
        La vérification peut prendre quelques minutes.
        {'\n'}
        Cette page se rafraîchit automatiquement.
      </Text>
    </View>
  );
}
