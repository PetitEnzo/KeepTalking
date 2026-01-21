import { supabase } from './supabase';

export interface XPResult {
  new_xp: number;
  new_level: number;
  level_up: boolean;
  unlocked_badges: any[];
}

/**
 * Add XP to a user and handle level ups
 */
export async function addExperience(
  userId: string,
  xpAmount: number,
  source: string = 'unknown'
): Promise<XPResult | null> {
  try {
    const { data, error } = await supabase.rpc('add_experience', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_source: source,
    });

    if (error) {
      console.error('Error adding experience:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in addExperience:', error);
    return null;
  }
}

/**
 * Check if user can contribute a word today
 */
export async function canContributeWord(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_contribute_word', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error checking contribution limit:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in canContributeWord:', error);
    return false;
  }
}

/**
 * Get user stats including XP, level, and badges
 */
export async function getUserStats(userId: string) {
  try {
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return null;
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('level, total_points, current_streak')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return null;
    }

    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('badge_id, unlocked_at, badges(*)')
      .eq('user_id', userId);

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    }

    return {
      ...stats,
      level: user?.level || 1,
      total_points: user?.total_points || 0,
      current_streak: user?.current_streak || 0,
      badges: badges || [],
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return null;
  }
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  // Reverse: xp = ((level - 1) ^ 2) * 100
  return Math.pow(currentLevel, 2) * 100;
}

/**
 * Calculate XP progress to next level
 */
export function getXPProgress(currentXP: number, currentLevel: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return {
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP: xpNeededForLevel,
    progress: Math.min(Math.max(progress, 0), 100),
  };
}

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  TRAINING_SESSION: 20,
  LESSON_COMPLETED: 100,
  WORD_CONTRIBUTION: 50,
  DAILY_STREAK: 10,
  EXERCISE_COMPLETED: 15,
};
