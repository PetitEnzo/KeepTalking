import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  currentPath: string;
  onPress: () => void;
}

function NavItem({ href, icon, label, currentPath, onPress }: NavItemProps) {
  const isActive = currentPath === href;
  
  return (
    <Link href={href as any} asChild>
      <Pressable 
        onPress={onPress}
        className={`flex-row items-center px-4 py-3 rounded-xl mb-2 ${
          isActive ? 'bg-blue-50' : 'active:bg-slate-50'
        }`}
      >
        <Text className="text-2xl mr-3">{icon}</Text>
        <Text className={`text-lg font-semibold ${
          isActive ? 'text-blue-600' : 'text-slate-700'
        }`}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50"
        onPress={onClose}
      >
        <Pressable 
          className="w-80 h-full bg-white"
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView className="flex-1">
            {/* User Profile Section */}
            <View className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 mb-4">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">
                  {user?.user_metadata?.username?.[0]?.toUpperCase() || '👤'}
                </Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1">
                {user?.user_metadata?.username || 'Utilisateur'}
              </Text>
              <Text className="text-white/80 text-sm">
                {user?.email}
              </Text>
              <View className="flex-row mt-4 space-x-3">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm font-semibold">
                    🔥 0 jours
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-sm font-semibold">
                    ⭐ 0 pts
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation */}
            <View className="px-4">
              <Text className="text-xs font-bold text-slate-400 uppercase mb-3 px-4">
                Navigation
              </Text>

              <NavItem
                href="/(tabs)"
                icon="🏠"
                label="Accueil"
                currentPath={pathname}
                onPress={onClose}
              />

              <NavItem
                href="/(tabs)/lessons"
                icon="📚"
                label="Leçons"
                currentPath={pathname}
                onPress={onClose}
              />

              <NavItem
                href="/(tabs)/progress"
                icon="📊"
                label="Progression"
                currentPath={pathname}
                onPress={onClose}
              />

              <NavItem
                href="/(tabs)/profile"
                icon="👤"
                label="Profil"
                currentPath={pathname}
                onPress={onClose}
              />

              {/* Divider */}
              <View className="h-px bg-slate-200 my-4" />

              <Text className="text-xs font-bold text-slate-400 uppercase mb-3 px-4">
                Ressources
              </Text>

              <Pressable 
                onPress={onClose}
                className="flex-row items-center px-4 py-3 rounded-xl mb-2 active:bg-slate-50"
              >
                <Text className="text-2xl mr-3">💬</Text>
                <Text className="text-lg font-semibold text-slate-700">
                  Chatbot LfPC
                </Text>
              </Pressable>

              <Pressable 
                onPress={onClose}
                className="flex-row items-center px-4 py-3 rounded-xl mb-2 active:bg-slate-50"
              >
                <Text className="text-2xl mr-3">📖</Text>
                <Text className="text-lg font-semibold text-slate-700">
                  Guide LfPC
                </Text>
              </Pressable>

              <Pressable 
                onPress={onClose}
                className="flex-row items-center px-4 py-3 rounded-xl mb-2 active:bg-slate-50"
              >
                <Text className="text-2xl mr-3">ℹ️</Text>
                <Text className="text-lg font-semibold text-slate-700">
                  À propos
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="border-t border-slate-200 p-4">
            <Text className="text-slate-400 text-xs text-center">
              KeepTalking v0.1.0
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
