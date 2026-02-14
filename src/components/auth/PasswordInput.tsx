import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps, Pressable } from 'react-native';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>
      <View className="flex-row items-center bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
        <RNTextInput
          className="flex-1 text-slate-900 text-base"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          {...props}
        />
        <Pressable 
          onPress={() => setShowPassword(!showPassword)} 
          className="ml-3 p-1 active:opacity-50"
        >
          <Text className="text-2xl">{showPassword ? '👁' : '🙈'}</Text>
        </Pressable>
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
