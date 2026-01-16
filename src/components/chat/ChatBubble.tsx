import { View, Text } from 'react-native';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-primary-500' : 'bg-gray-200'
        }`}
      >
        <Text className={`text-base ${isUser ? 'text-white' : 'text-gray-800'}`}>
          {message}
        </Text>
      </View>
      {timestamp && (
        <Text className="text-xs text-gray-500 mt-1 px-2">
          {timestamp}
        </Text>
      )}
    </View>
  );
}
