import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  image_key: string;
  image_url?: string;
  unlocked_at?: string;
  category: 'progression' | 'regularity' | 'mastery' | 'performance' | 'social' | 'challenge';
}

export interface UnlockedBadge {
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_image_key: string;
}

/**
 * Check and unlock badges for a user
 * This calls the SQL function that checks all badge conditions
 */
export async function checkAndUnlockBadges(userId: string): Promise<UnlockedBadge[]> {
  try {
    const { data, error } = await supabase.rpc('check_and_unlock_badges', {
      p_user_id: userId
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

/**
 * Get all badges unlocked by a user
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        unlocked_at,
        image_url,
        badges:badge_id (
          badge_id,
          name,
          description,
          icon,
          image_key,
          category
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    // Flatten the data structure
    return (data || []).map((item: any) => ({
      badge_id: item.badges.badge_id,
      name: item.badges.name,
      description: item.badges.description,
      icon: item.badges.icon,
      image_key: item.badges.image_key,
      category: item.badges.category,
      unlocked_at: item.unlocked_at,
      image_url: item.image_url,
    }));
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Get badge count for a user
 */
export async function getUserBadgeCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error fetching badge count:', error);
    return 0;
  }
}

/**
 * Show badge unlock alert
 */
export function showBadgeUnlockAlert(badges: UnlockedBadge[]) {
  if (badges.length === 0) return;

  if (badges.length === 1) {
    const badge = badges[0];
    Alert.alert(
      '🎉 Badge débloqué !',
      `${badge.badge_icon} ${badge.badge_name}\n\n${badge.badge_description}`,
      [{ text: 'Super !', style: 'default' }]
    );
  } else {
    const badgeList = badges.map(b => `${b.badge_icon} ${b.badge_name}`).join('\n');
    Alert.alert(
      '🎉 Badges débloqués !',
      `Vous avez débloqué ${badges.length} nouveaux badges !\n\n${badgeList}`,
      [{ text: 'Génial !', style: 'default' }]
    );
  }
}

/**
 * Check badges after completing a lesson
 */
export async function checkBadgesAfterLesson(userId: string) {
  const unlockedBadges = await checkAndUnlockBadges(userId);
  if (unlockedBadges.length > 0) {
    showBadgeUnlockAlert(unlockedBadges);
  }
}

/**
 * Check badges after gaining XP
 */
export async function checkBadgesAfterXP(userId: string) {
  const unlockedBadges = await checkAndUnlockBadges(userId);
  if (unlockedBadges.length > 0) {
    showBadgeUnlockAlert(unlockedBadges);
  }
}

/**
 * Check badges after updating streak
 */
export async function checkBadgesAfterStreak(userId: string) {
  const unlockedBadges = await checkAndUnlockBadges(userId);
  if (unlockedBadges.length > 0) {
    showBadgeUnlockAlert(unlockedBadges);
  }
}

/**
 * Check badges after word contribution
 */
export async function checkBadgesAfterContribution(userId: string) {
  const unlockedBadges = await checkAndUnlockBadges(userId);
  if (unlockedBadges.length > 0) {
    showBadgeUnlockAlert(unlockedBadges);
  }
}

/**
 * Load badge images from Supabase Storage
 */
export async function loadBadgeImages(badges: Badge[]): Promise<Badge[]> {
  const badgesWithImages = await Promise.all(
    badges.map(async (badge) => {
      if (!badge.image_key) return badge;

      try {
        const { data } = supabase.storage
          .from('badges')
          .getPublicUrl(badge.image_key + '.png');

        return {
          ...badge,
          image_url: data.publicUrl,
        };
      } catch (error) {
        console.error(`Error loading image for badge ${badge.name}:`, error);
        return badge;
      }
    })
  );

  return badgesWithImages;
}
