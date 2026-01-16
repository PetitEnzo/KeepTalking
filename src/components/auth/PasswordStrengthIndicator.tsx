import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    
    let strength = 0;
    
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    
    if (strength <= 1) return { level: 1, label: 'Faible', color: 'bg-red-500' };
    if (strength <= 3) return { level: 2, label: 'Moyen', color: 'bg-yellow-500' };
    return { level: 3, label: 'Fort', color: 'bg-green-500' };
  };

  const strength = getStrength(password);
  
  if (!password) return null;

  return (
    <View className="mb-4">
      <View className="flex-row gap-2 mb-2">
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            className={`flex-1 h-2 rounded-full ${
              level <= strength.level ? strength.color : 'bg-slate-200'
            }`}
          />
        ))}
      </View>
      <Text className="text-sm text-slate-600">
        Force du mot de passe : <Text className="font-semibold">{strength.label}</Text>
      </Text>
    </View>
  );
}
