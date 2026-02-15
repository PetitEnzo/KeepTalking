import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, Image, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';
import BadgeDisplay from '../../components/BadgeDisplay';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface LessonProgress {
  lesson_id: string;
  completed_at: string;
  score: number;
}

// Images de profil disponibles
const AVATAR_OPTIONS = [
  { id: '1', type: 'image', value: 'bunnyprfp', name: 'Lapin' },
  { id: '2', type: 'image', value: 'dogprfp', name: 'Chien' },
  { id: '3', type: 'image', value: 'dog2prfp', name: 'Chien 2' },
  { id: '4', type: 'image', value: 'koalaprfp', name: 'Koala' },
  { id: '5', type: 'image', value: 'loutreprfp', name: 'Loutre' },
  { id: '6', type: 'image', value: 'paresseuxprfp', name: 'Paresseux' },
  { id: '7', type: 'image', value: 'pdarouxprfp', name: 'Panda' },
  { id: '8', type: 'image', value: 'soincprfp', name: 'Soin' },
];

// Fonction pour vérifier si c'est une image ou un emoji
const isImageAvatar = (avatar: string) => {
  return avatar && (avatar.includes('prfp') || avatar.startsWith('avatar') || avatar.includes('.png') || avatar.includes('.jpg'));
};

// Fonction pour obtenir la source de l'image
const getAvatarImageSource = (avatarId: string) => {
  try {
    // Charger les images réelles du dossier profile_pictures
    switch(avatarId) {
      case 'bunnyprfp':
        return require('../../../assets/images/profile_pictures/bunnyprfp.jpg');
      case 'dogprfp':
        return require('../../../assets/images/profile_pictures/dogprfp.jpg');
      case 'dog2prfp':
        return require('../../../assets/images/profile_pictures/dog2prfp.jpg');
      case 'koalaprfp':
        return require('../../../assets/images/profile_pictures/koalaprfp.jpg');
      case 'loutreprfp':
        return require('../../../assets/images/profile_pictures/loutreprfp.jpg');
      case 'paresseuxprfp':
        return require('../../../assets/images/profile_pictures/paresseuxprfp.jpg');
      case 'pdarouxprfp':
        return require('../../../assets/images/profile_pictures/pdarouxprfp.jpg');
      case 'soincprfp':
        return require('../../../assets/images/profile_pictures/soincprfp.jpg');
      default:
        return null;
    }
  } catch (error) {
    console.log(`Image ${avatarId} non trouvée`);
    return null;
  }
};

const LESSON_NAMES: { [key: string]: string } = {
  '1': 'Introduction au LFPC',
  '2': 'Les 8 configurations de main',
  '3': 'Les 5 positions autour du visage',
  '4': 'Vos premiers mots en LFPC',
  '5': 'Combinaisons avancées',
  '6': 'Phrases courantes',
  '7': 'Fluidité et rythme',
  '8': 'Conversations complexes',
  '9': 'Expressions idiomatiques',
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [completedLessons, setCompletedLessons] = useState<LessonProgress[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [userStats, setUserStats] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Rediriger les utilisateurs non connectés vers la page de création de compte
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/signup');
    }
  }, [user]);

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  // Navigation au clavier
  useKeyboardNavigation({
    onEscape: () => {
      if (showAvatarModal) {
        setShowAvatarModal(false);
      }
    },
    enabled: true,
  });

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      // Charger les données utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('user_id, level, total_points, current_streak')
        .eq('auth_user_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.user_id);
        const currentLevel = userData.level || 1;
        const totalXP = userData.total_points || 0;
        
        setUserLevel(currentLevel);
        setCurrentXP(totalXP);
        // Ne pas définir le streak ici, il sera chargé depuis user_profiles plus bas
        
        // Calculer l'XP pour le niveau suivant
        // Formule : xp_needed = (level ^ 2) * 100
        const xpNeededForNextLevel = Math.pow(currentLevel, 2) * 100;
        setXpForNextLevel(xpNeededForNextLevel);

        // Charger les stats
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userData.user_id)
          .single();

        if (stats) {
          setUserStats(stats);
        }
      }

      // Charger les leçons terminées (seulement celles réussies)
      const { data: lessons, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .eq('passed', true)
        .order('completed_at', { ascending: false });

      if (!lessonsError && lessons) {
        setCompletedLessons(lessons);
        setTotalLessons(lessons.length);
      }

      // Charger le streak depuis users_profiles avec id
      console.log('🔍 Chargement streak pour user.id:', user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('users_profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      console.log('📊 Résultat users_profiles:', { profileData, profileError });

      if (!profileError && profileData) {
        console.log('✅ Streak trouvée:', profileData.current_streak);
        setStreak(profileData.current_streak || 0);
      } else {
        console.log('❌ Erreur ou pas de données streak');
      }

      // Charger l'avatar depuis users_profiles
      const { data: avatarData, error: avatarError } = await supabase
        .from('users_profiles')
        .select('avatar')
        .eq('id', user.id)
        .single();

      if (!avatarError && avatarData) {
        setSelectedAvatar(avatarData.avatar || '👤');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    if (!user) {
      console.log('❌ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔄 Changement d\'avatar vers:', avatar);
    console.log('👤 User ID:', user.id);

    try {
      // Utiliser upsert pour créer ou mettre à jour le profil
      const { data, error } = await supabase
        .from('users_profiles')
        .upsert({ 
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          avatar: avatar,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select();

      console.log('📊 Résultat Supabase:', { data, error });

      if (!error) {
        console.log('✅ Avatar changé avec succès');
        setShowAvatarModal(false);
        // Forcer le refresh complet de la page
        console.log('🔄 Refresh de la page...');
        setLoading(true);
        await loadUserProgress();
        // Notifier le sidebar de rafraîchir l'avatar
        window.dispatchEvent(new CustomEvent('avatarChanged'));
        console.log('✅ Refresh terminé');
      } else {
        console.error('❌ Erreur lors de la mise à jour:', error);
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Exception lors du changement d\'avatar:', error);
      alert(`Exception: ${error}`);
    }
  };


  if (loading) {
    return (
      <ImageBackground 
        source={require('../../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.loadingContainer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={require('../../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content]}>
        {/* Header avec avatar */}
        <View style={styles.header}>
          <Pressable onPress={() => setShowAvatarModal(true)} style={styles.avatarContainer}>
            {isImageAvatar(selectedAvatar) && getAvatarImageSource(selectedAvatar) ? (
              <Image 
                source={getAvatarImageSource(selectedAvatar)} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatar}>{selectedAvatar}</Text>
            )}
          </Pressable>
          
          <Text style={[styles.username, { color: colors.text }]}>
            {user?.user_metadata?.username || 'Utilisateur'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalLessons}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Leçons terminées</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>🔥 {streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jours de suite</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userStats?.total_words_contributed || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mots contribués</Text>
          </View>
        </View>

        {/* Progression XP */}
        <View style={[styles.xpSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.xpHeader}>
            <Text style={[styles.xpLevel, { color: colors.text }]}>Niveau {userLevel}</Text>
            <Text style={[styles.xpText, { color: colors.textSecondary }]}>{currentXP} / {xpForNextLevel} XP</Text>
          </View>
          
          <View style={styles.xpBarContainer}>
            <View 
              style={[
                styles.xpBarFill, 
                { width: `${Math.min((currentXP / xpForNextLevel) * 100, 100)}%` }
              ]} 
            />
          </View>
          
          <Text style={[styles.xpNextLevel, { color: colors.textSecondary }]}>
            {xpForNextLevel - currentXP} XP pour atteindre le niveau {userLevel + 1}
          </Text>
        </View>

        {/* Badges */}
        {userId && (
          <View style={[styles.badgesSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <BadgeDisplay userId={userId} showTitle={true} />
          </View>
        )}

        {/* Sources d'XP */}
        <View style={[styles.xpSourcesSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sources d'XP</Text>
          
          <View style={[styles.xpSourceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.xpSourceIcon}>🎯</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: colors.text }]}>Session d'entraînement</Text>
              <Text style={[styles.xpSourceValue, { color: colors.success }]}>+20 XP</Text>
            </View>
          </View>

          <View style={[styles.xpSourceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.xpSourceIcon}>📚</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: colors.text }]}>Leçon terminée</Text>
              <Text style={[styles.xpSourceValue, { color: colors.success }]}>+100 XP</Text>
            </View>
          </View>

          <View style={[styles.xpSourceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.xpSourceIcon}>✍️</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: colors.text }]}>Mot contribué (validé)</Text>
              <Text style={[styles.xpSourceValue, { color: colors.success }]}>+50 XP (max 5/jour)</Text>
            </View>
          </View>

          <View style={[styles.xpSourceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.xpSourceIcon}>📝</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: colors.text }]}>Exercice complété</Text>
              <Text style={[styles.xpSourceValue, { color: colors.success }]}>+15 XP</Text>
            </View>
          </View>

          <View style={[styles.xpSourceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.xpSourceIcon}>🔥</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: colors.text }]}>Streak quotidien</Text>
              <Text style={[styles.xpSourceValue, { color: colors.success }]}>+10 XP/jour</Text>
            </View>
          </View>
        </View>

        {/* Leçons terminées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Leçons terminées</Text>
          
          {completedLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyText}>Aucune leçon terminée pour le moment</Text>
              <Pressable 
                onPress={() => router.push('/(tabs)/lessons')}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Commencer une leçon</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.lessonsGrid}>
              {completedLessons.map((lesson) => (
                <View key={lesson.lesson_id} style={[styles.lessonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.lessonCheck}>✓</Text>
                  <Text style={[styles.lessonName, { color: colors.text }]}>
                    {LESSON_NAMES[lesson.lesson_id] || `Leçon ${lesson.lesson_id}`}
                  </Text>
                  <Text style={[styles.lessonDate, { color: colors.textSecondary }]}>
                    {new Date(lesson.completed_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </View>

      {/* Modal de sélection d'avatar */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir un avatar</Text>
            
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleAvatarChange(option.value)}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === option.value && styles.avatarOptionSelected
                  ]}
                >
                  {option.type === 'image' && getAvatarImageSource(option.value) ? (
                    <Image 
                      source={getAvatarImageSource(option.value)} 
                      style={styles.avatarOptionImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarOptionEmoji}>{option.value}</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable 
              onPress={() => setShowAvatarModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 80,
    width: 120,
    height: 120,
    textAlign: 'center',
    lineHeight: 120,
    backgroundColor: '#EFF6FF',
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
  },
  editIcon: {
    fontSize: 16,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  xpSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  xpText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  xpBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  xpNextLevel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  xpSourcesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  xpSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  xpSourceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  xpSourceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpSourceName: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  xpSourceValue: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lessonsGrid: {
    gap: 12,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonCheck: {
    fontSize: 24,
    color: '#10B981',
    marginRight: 12,
  },
  lessonName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  lessonDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  avatarOption: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 4,
  },
  avatarOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 3,
  },
  avatarOptionEmoji: {
    fontSize: 40,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  badgesSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  modalCloseButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
