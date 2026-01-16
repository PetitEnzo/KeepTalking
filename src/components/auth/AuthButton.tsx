import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface AuthButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AuthButton({ title, loading, variant = 'primary', disabled, ...props }: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Pressable
      className={`rounded-xl py-4 px-6 items-center justify-center shadow-md ${
        isPrimary 
          ? 'bg-blue-600 active:bg-blue-700 active:shadow-lg' 
          : 'bg-slate-200 active:bg-slate-300 active:shadow-lg'
      } ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#2563EB'} />
      ) : (
        <Text className={`text-lg font-bold ${isPrimary ? 'text-white' : 'text-slate-700'}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
