import React from 'react';
import { View, Text } from 'react-native';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">⚠️</Text>
        <Text className="flex-1 text-red-700 font-medium">
          {message}
        </Text>
      </View>
    </View>
  );
}
