import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuPress?: () => void;
  title?: string;
}

export function Header({ onMenuPress, title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between shadow-sm">
      {/* Left: Menu Button + Logo */}
      <View className="flex-row items-center">
        {onMenuPress && (
          <Pressable 
            onPress={onMenuPress}
            className="mr-4 p-2 active:bg-slate-100 rounded-lg"
          >
            <View className="space-y-1">
              <View className="w-6 h-0.5 bg-slate-700" />
              <View className="w-6 h-0.5 bg-slate-700" />
              <View className="w-6 h-0.5 bg-slate-700" />
            </View>
          </Pressable>
        )}
        
        <Image
          source={require('../../../assets/images/logoColor.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
        
        <Text className="text-xl font-bold text-slate-900 ml-3">
          {title || 'KeepTalking'}
        </Text>
      </View>

      {/* Right: User Info */}
      <View className="flex-row items-center">
        {/* Streak */}
        <View className="flex-row items-center bg-orange-50 px-3 py-2 rounded-full mr-3">
          <Text className="text-xl mr-1">🔥</Text>
          <Text className="text-orange-600 font-bold">0</Text>
        </View>

        {/* Points */}
        <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-full mr-3">
          <Text className="text-xl mr-1">⭐</Text>
          <Text className="text-yellow-600 font-bold">0</Text>
        </View>

        {/* User Avatar */}
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
          <Text className="text-xl">
            {user?.user_metadata?.username?.[0]?.toUpperCase() || '👤'}
          </Text>
        </View>
      </View>
    </View>
  );
}
