import React from 'react';
import { View, Text } from 'react-native';

export default function ChatScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-4xl mb-4">💬</Text>
      <Text className="text-2xl font-bold text-slate-900 mb-2">
        Chatbot LfPC
      </Text>
      <Text className="text-slate-600 text-center">
        Le chatbot sera bientôt disponible
      </Text>
    </View>
  );
}
