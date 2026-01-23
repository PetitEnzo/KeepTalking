import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';

type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: LessonLevel;
  emoji: string;
  completed?: boolean;
}

const lessons: Lesson[] = [
  // Débutant
  {
    id: '1',
    title: 'Introduction au LFPC',
    description: 'Découvrez les bases du Langage Français Parlé Complété',
    duration: '2 min',
    level: 'beginner',
    emoji: '👋',
  },
  {
    id: '2',
    title: 'Les 8 configurations de main',
    description: 'Apprenez les 8 formes de main essentielles',
    duration: '3 min',
    level: 'beginner',
    emoji: '✋',
  },
  {
    id: '3',
    title: 'Les 5 positions autour du visage',
    description: 'Maîtrisez les 5 emplacements clés',
    duration: '3 min',
    level: 'beginner',
    emoji: '👤',
  },
  {
    id: '4',
    title: 'Vos premiers mots en LFPC',
    description: 'Pratiquez des mots simples du quotidien',
    duration: '5 min',
    level: 'beginner',
    emoji: '💬',
  },
  // Intermédiaire
  {
    id: '5',
    title: 'Combinaisons avancées',
    description: 'Associez configurations et positions',
    duration: '10 min',
    level: 'intermediate',
    emoji: '🔄',
  },
  {
    id: '6',
    title: 'Phrases courantes',
    description: 'Construisez des phrases complètes',
    duration: '25 min',
    level: 'intermediate',
    emoji: '💭',
  },
  {
    id: '7',
    title: 'Fluidité et rythme',
    description: 'Améliorez votre vitesse d\'exécution',
    duration: '20 min',
    level: 'intermediate',
    emoji: '⚡',
  },
  // Avancé
  {
    id: '8',
    title: 'Conversations complexes',
    description: 'Dialogues élaborés et nuancés',
    duration: '30 min',
    level: 'advanced',
    emoji: '🗣️',
  },
  {
    id: '9',
    title: 'Expressions idiomatiques',
    description: 'Expressions et tournures spécifiques',
    duration: '25 min',
    level: 'advanced',
    emoji: '🎭',
  },
];

export default function LessonsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<LessonLevel>('beginner');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [failedLessonIds, setFailedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCompletedLessons();
  }, [user]);

  // Basculer automatiquement sur intermediate si toutes les leçons débutant sont complétées
  useEffect(() => {
    const beginnerLessons = lessons.filter(l => l.level === 'beginner');
    const allBeginnerCompleted = beginnerLessons.every(lesson => completedLessonIds.has(lesson.id));
    
    if (allBeginnerCompleted && beginnerLessons.length > 0 && selectedLevel === 'beginner') {
      setSelectedLevel('intermediate');
    }
  }, [completedLessonIds]);

  const loadCompletedLessons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, passed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (!error && data) {
        const passed = new Set<string>();
        const failed = new Set<string>();
        
        data.forEach(item => {
          if (item.passed) {
            passed.add(item.lesson_id);
          } else {
            failed.add(item.lesson_id);
          }
        });
        
        setCompletedLessonIds(passed);
        setFailedLessonIds(failed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des leçons terminées:', error);
    }
  };

  const filteredLessons = lessons.filter(lesson => lesson.level === selectedLevel);

  const getLevelLabel = (level: LessonLevel) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>📚 Mes Leçons</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Progressez à votre rythme avec nos leçons interactives
        </Text>

        {/* Filtres de niveau */}
        <View style={styles.filterContainer}>
          {(['beginner', 'intermediate', 'advanced'] as LessonLevel[]).map((level) => (
            <Pressable
              key={level}
              onPress={() => setSelectedLevel(level)}
              style={[
                styles.filterButton,
                selectedLevel === level && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                selectedLevel === level && styles.filterButtonTextActive
              ]}>
                {getLevelLabel(level)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Bandeau de félicitations pour avoir complété les leçons débutant */}
        {selectedLevel === 'beginner' &&
         completedLessonIds.has('1') && 
         completedLessonIds.has('2') && 
         completedLessonIds.has('3') && 
         completedLessonIds.has('4') && (
          <View style={styles.congratsBanner}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <View style={styles.congratsContent}>
              <Text style={styles.congratsTitle}>Félicitations !</Text>
              <Text style={styles.congratsText}>
                Vous avez terminé toutes les leçons débutant ! Vous êtes maintenant prêt à passer aux leçons intermédiaires.
              </Text>
              <Text style={styles.congratsHint}>
                💡 N'hésitez pas à revenir sur ces leçons quand vous en avez besoin pour réviser les bases.
              </Text>
              <Pressable 
                style={styles.congratsButton}
                onPress={() => setSelectedLevel('intermediate')}
              >
                <Text style={styles.congratsButtonText}>
                  Découvrir les leçons intermédiaires →
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bandeau de félicitations pour avoir complété les leçons intermédiaires */}
        {selectedLevel === 'intermediate' &&
         completedLessonIds.has('5') && 
         completedLessonIds.has('6') && 
         completedLessonIds.has('7') && (
          <View style={styles.congratsBanner}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <View style={styles.congratsContent}>
              <Text style={styles.congratsTitle}>Bravo !</Text>
              <Text style={styles.congratsText}>
                Vous avez terminé toutes les leçons intermédiaires ! Vous maîtrisez maintenant les bases du LFPC. Prêt pour le niveau avancé ?
              </Text>
              <Text style={styles.congratsHint}>
                💡 Les leçons intermédiaires restent disponibles pour vous entraîner quand vous le souhaitez.
              </Text>
              <Pressable 
                style={styles.congratsButton}
                onPress={() => setSelectedLevel('advanced')}
              >
                <Text style={styles.congratsButtonText}>
                  Découvrir les leçons avancées →
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bandeau de félicitations pour avoir complété les leçons avancées */}
        {selectedLevel === 'advanced' &&
         completedLessonIds.has('8') && 
         completedLessonIds.has('9') && (
          <View style={styles.congratsBanner}>
            <Text style={styles.congratsEmoji}>🎊</Text>
            <View style={styles.congratsContent}>
              <Text style={styles.congratsTitle}>Félicitations ! Vous avez terminé toutes les leçons !</Text>
              <Text style={styles.congratsText}>
                Vous maîtrisez maintenant le LFPC de A à Z ! Vous êtes un codeur accompli.
              </Text>
              <Text style={styles.congratsHint}>
                💡 N'hésitez pas à refaire les leçons pour consolider vos acquis, et découvrez (ou redécouvrez) les jeux et l'entraînement pour pratiquer !
              </Text>
              <View style={styles.congratsButtonsRow}>
                <Pressable 
                  style={[styles.congratsButton, styles.congratsButtonSecondary]}
                  onPress={() => router.push('/(tabs)/training')}
                >
                  <Text style={styles.congratsButtonTextSecondary}>
                    🎯 Entraînement
                  </Text>
                </Pressable>
                <Pressable 
                  style={styles.congratsButton}
                  onPress={() => router.push('/(tabs)/basics')}
                >
                  <Text style={styles.congratsButtonText}>
                    🎮 Les bases du code
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Liste des leçons */}
        <View style={styles.lessonsContainer}>
          {filteredLessons.map((lesson) => (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [
                styles.lessonCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.lessonCardPressed,
                completedLessonIds.has(lesson.id) && styles.lessonCardCompleted,
                failedLessonIds.has(lesson.id) && styles.lessonCardFailed
              ]}
              onPress={() => {
                router.push(`/(tabs)/lesson/${lesson.id}`);
              }}
            >
              {completedLessonIds.has(lesson.id) && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              )}
              {failedLessonIds.has(lesson.id) && (
                <View style={styles.failedBadge}>
                  <Text style={styles.failedBadgeText}>✕</Text>
                </View>
              )}
              
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                <View style={styles.lessonBadge}>
                  <Text style={styles.lessonBadgeText}>{lesson.duration}</Text>
                </View>
              </View>
              
              <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
              <Text style={[styles.lessonDescription, { color: colors.textSecondary }]}>{lesson.description}</Text>
              
              <View style={styles.lessonFooter}>
                <Text style={styles.lessonLevel}>
                  {getLevelLabel(lesson.level)}
                </Text>
                <Text style={styles.lessonAction}>
                  {completedLessonIds.has(lesson.id) ? 'Revoir →' : failedLessonIds.has(lesson.id) ? 'Réessayer →' : 'Commencer →'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  lessonCardPressed: {
    opacity: 0.8,
  },
  lessonCardCompleted: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  lessonCardFailed: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  failedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  failedBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonEmoji: {
    fontSize: 40,
  },
  lessonBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lessonBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  lessonAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  congratsBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#86EFAC',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  congratsEmoji: {
    fontSize: 48,
  },
  congratsContent: {
    flex: 1,
  },
  congratsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
    marginBottom: 12,
  },
  congratsHint: {
    fontSize: 13,
    color: '#16A34A',
    lineHeight: 18,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  congratsButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  congratsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  congratsButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  congratsButtonSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  congratsButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
});
