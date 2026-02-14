import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Animated, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getUserBadges, loadBadgeImages, Badge } from '../services/badgeService';

interface BadgeDisplayProps {
  userId: string;
  maxDisplay?: number; // Maximum number of badges to display (for home screen)
  showTitle?: boolean;
}

interface BadgeCardProps {
  badge: Badge;
  colors: any;
}

function BadgeCard({ badge, colors }: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeRotateX = useRef(new Animated.Value(0)).current;
  const badgeRotateY = useRef(new Animated.Value(0)).current;

  const handleMouseEnter = () => {
    setIsHovered(true);
    Animated.spring(badgeScaleAnim, {
      toValue: 2.5, // 150% increase = 2.5x scale
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.spring(badgeScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(badgeRotateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(badgeRotateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  };

  const handleMouseMove = (event: any) => {
    if (!isHovered) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -20;
    const rotateYValue = ((x - centerX) / centerX) * 20;

    Animated.parallel([
      Animated.spring(badgeRotateX, {
        toValue: rotateXValue,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(badgeRotateY, {
        toValue: rotateYValue,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  };

  return (
    <Pressable
      onHoverIn={handleMouseEnter}
      onHoverOut={handleMouseLeave}
      // @ts-ignore - onMouseMove is web-only
      onMouseMove={handleMouseMove}
      style={{ 
        zIndex: isHovered ? 999999 : 1,
        position: 'relative',
        elevation: isHovered ? 999999 : 1,
      }}
    >
      <View
        style={[
          styles.badgeCard,
          {
            backgroundColor: isHovered ? (colors.background || '#FFFFFF') : 'rgba(0,0,0,0)',
            borderColor: isHovered ? colors.primary || '#3B82F6' : colors.border,
            borderWidth: isHovered ? 2 : 1,
            overflow: 'visible',
            zIndex: isHovered ? 999999 : 1,
          },
        ]}
      >
        {badge.image_url ? (
          <View style={{ backgroundColor: 'rgba(0,0,0,0)', padding: 0, margin: 0 }}>
            <Animated.Image
              source={{ uri: badge.image_url }}
              style={[
                styles.badgeImage,
                {
                  zIndex: 1000, // Badge au premier plan
                  backgroundColor: 'rgba(0,0,0,0)', // RGBA pour forcer la transparence
                  transform: [
                  { scale: badgeScaleAnim },
                  {
                    rotateX: badgeRotateX.interpolate({
                      inputRange: [-20, 20],
                      outputRange: ['-20deg', '20deg'],
                    }),
                  },
                  {
                    rotateY: badgeRotateY.interpolate({
                      inputRange: [-20, 20],
                      outputRange: ['-20deg', '20deg'],
                    }),
                  },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={{ backgroundColor: 'rgba(0,0,0,0)', padding: 0, margin: 0 }}>
            <Animated.Text
              style={[
                styles.badgeIcon,
                {
                  zIndex: 1000, // Badge au premier plan
                  backgroundColor: 'rgba(0,0,0,0)', // RGBA pour forcer la transparence
                  transform: [
                    { scale: badgeScaleAnim },
                    {
                      rotateX: badgeRotateX.interpolate({
                        inputRange: [-20, 20],
                        outputRange: ['-20deg', '20deg'],
                      }),
                    },
                    {
                      rotateY: badgeRotateY.interpolate({
                        inputRange: [-20, 20],
                        outputRange: ['-20deg', '20deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {badge.icon}
            </Animated.Text>
          </View>
        )}
        {!isHovered && (
          <>
            <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
              {badge.name}
            </Text>
            <Text style={[styles.badgeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {badge.description}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

export default function BadgeDisplay({ userId, maxDisplay, showTitle = true }: BadgeDisplayProps) {
  const { colors } = useTheme();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      let userBadges = await getUserBadges(userId);
      
      // Load images for badges
      userBadges = await loadBadgeImages(userBadges);
      
      // Limit display if maxDisplay is set
      if (maxDisplay && userBadges.length > maxDisplay) {
        userBadges = userBadges.slice(0, maxDisplay);
      }
      
      setBadges(userBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {showTitle && <Text style={[styles.title, { color: colors.text }]}>🏆 Badges</Text>}
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (badges.length === 0) {
    return (
      <View style={styles.container}>
        {showTitle && <Text style={[styles.title, { color: colors.text }]}>🏆 Badges</Text>}
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Aucun badge débloqué pour le moment. Continuez à progresser !
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>🏆 Badges</Text>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {badges.length} débloqué{badges.length > 1 ? 's' : ''} sur 28
          </Text>
          <Text style={[styles.encouragementText, { color: colors.textSecondary }]}>
            Continuez à vous entraîner pour en débloquer de nouveaux !
          </Text>
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.badgeScroll, { overflow: 'visible' }]}
        contentContainerStyle={[styles.badgeScrollContent, { overflow: 'visible' }]}
      >
        {badges.map((badge) => (
          <BadgeCard key={badge.badge_id} badge={badge} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    overflow: 'visible', // Permet au badge de sortir du container
  },
  header: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  badgeScroll: {
    flexGrow: 0,
    overflow: 'visible', // Permet au badge de sortir du scroll
  },
  badgeScrollContent: {
    paddingRight: 16,
    paddingTop: 60, // Espace en haut pour que le badge puisse sortir
    paddingBottom: 60, // Espace en bas pour que le badge puisse sortir
    overflow: 'visible',
  },
  badgeCard: {
    width: 180, // Augmenté de 50% (120 -> 180)
    padding: 18, // Augmenté proportionnellement
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  badgeImage: {
    width: 90, // Augmenté de 50% (60 -> 90)
    height: 90,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0)', // Force la transparence dans le style de base
  },
  badgeIcon: {
    fontSize: 72, // Augmenté de 50% (48 -> 72)
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    textAlign: 'center',
  },
});
