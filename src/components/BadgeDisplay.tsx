import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getUserBadges, loadBadgeImages, Badge } from '../services/badgeService';

interface BadgeDisplayProps {
  userId: string;
  maxDisplay?: number; // Maximum number of badges to display (for home screen)
  showTitle?: boolean;
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
            {badges.length} débloqué{badges.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.badgeScroll}
        contentContainerStyle={styles.badgeScrollContent}
      >
        {badges.map((badge) => (
          <View 
            key={badge.badge_id} 
            style={[styles.badgeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {badge.image_url ? (
              <Image 
                source={{ uri: badge.image_url }} 
                style={styles.badgeImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
            )}
            <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
              {badge.name}
            </Text>
            <Text style={[styles.badgeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {badge.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgeCount: {
    fontSize: 14,
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
  },
  badgeScrollContent: {
    paddingRight: 16,
  },
  badgeCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  badgeImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
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
