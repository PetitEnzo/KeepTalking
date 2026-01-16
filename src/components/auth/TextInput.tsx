import React from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function TextInput({ label, error, icon, placeholder, value, onChangeText, ...props }: CustomTextInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>
      <View className="flex-row items-center bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 shadow-sm focus:border-blue-500">
        {icon && <View className="mr-3">{icon}</View>}
        <RNTextInput
          className="flex-1 text-slate-900 text-base"
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
