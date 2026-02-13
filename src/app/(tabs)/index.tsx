import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';
import { router } from 'expo-router';
import HoverableCard from '../../components/common/HoverableCard';
import BadgeDisplay from '../../components/BadgeDisplay';

type UserProfile = 'deaf' | 'hearing' | 'family' | 'professional' | null;
type UserLevel = 'beginner' | 'intermediate' | 'advanced' | null;
type UserGoal = 'communication' | 'professional' | 'family' | 'curiosity' | null;

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Réponses du questionnaire
  const [profile, setProfile] = useState<UserProfile>(null);
  const [level, setLevel] = useState<UserLevel>(null);
  const [goal, setGoal] = useState<UserGoal>(null);

  useEffect(() => {
    checkOnboardingStatus();
    loadStreak();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, user_profile, user_level, user_goal')
        .eq('auth_user_id', user.id)
        .single();

      if (data) {
        setUserId(data.user_id);
        if (data.user_profile) {
          setHasCompletedOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Erreur vérification onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('current_streak')
        .eq('auth_user_id', user.id)
        .single();

      if (data) {
        setCurrentStreak(data.current_streak || 0);
      }
    } catch (error) {
      console.error('Erreur chargement streak:', error);
    }
  };

  const saveOnboarding = async () => {
    if (!user || !profile || !level || !goal) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          user_profile: profile,
          user_level: level,
          user_goal: goal,
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Erreur sauvegarde onboarding:', error);
      alert('Erreur lors de la sauvegarde de vos préférences');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    return (
      <ScrollView style={[styles.completedContainer, { backgroundColor: colors.background }]}>
        <View style={styles.completedContent}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Bienvenue {user?.user_metadata?.username || 'Utilisateur'} ! 👋
          </Text>
          
          {/* Streak */}
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakContent}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>jour{currentStreak > 1 ? 's' : ''} de suite</Text>
            </View>
          </View>

          {/* Badges */}
          {userId && (
            <View style={[styles.badgesSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <BadgeDisplay userId={userId} maxDisplay={5} showTitle={true} />
            </View>
          )}

          {/* Description de l'application */}
          <View style={[styles.descriptionSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>Bienvenue sur Keep Talking ! 👋</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              Keep Talking est votre compagnon d'apprentissage de la <Text style={{ fontWeight: '600', color: colors.text }}>Langue française Parlée Complétée (LFPC)</Text>. 
              Cette application vous permet d'apprendre et de pratiquer le LFPC de manière interactive grâce à la détection en temps réel de vos configurations de main et de visage.
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary, marginTop: 12 }]}>
              Que vous soyez débutant ou avancé, professionnel ou curieux, nos leçons progressives, exercices pratiques et mini-jeux vous aideront à maîtriser cette méthode de communication essentielle pour l'accessibilité des personnes sourdes et malentendantes.
            </Text>
          </View>

          {/* Bannière d'avertissement */}
          <View style={[styles.warningBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: colors.error }]}>Application en développement</Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                Cette application est un complément d'apprentissage et ne remplace pas les cours de LFPC. Des erreurs peuvent être présentes. N'hésitez pas à nous signaler tout problème !
              </Text>
            </View>
          </View>

          {/* Grille de cartes */}
          <View style={styles.cardsGrid}>
            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/lessons')}
            >
              <Text style={styles.gridCardIcon}>📚</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Leçons</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Apprenez les bases du LFPC étape par étape
              </Text>
            </HoverableCard>

            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/training-beginner')}
            >
              <Text style={styles.gridCardIcon}>🖐️</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Entraînement Débutant</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Pratiquez les configurations de main de base
              </Text>
            </HoverableCard>

            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/training')}
            >
              <Text style={styles.gridCardIcon}>🎯</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Entraînement Avancé</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Codez des mots complets avec détection en temps réel
              </Text>
            </HoverableCard>

            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/contribute')}
            >
              <Text style={styles.gridCardIcon}>✍️</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Ajouter un mot</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Contribuez en proposant de nouveaux mots à coder
              </Text>
            </HoverableCard>

            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/basics')}
            >
              <Text style={styles.gridCardIcon}>📖</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Les bases du code</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Découvrez les fondamentaux du LFPC
              </Text>
            </HoverableCard>

            <HoverableCard 
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              hoverStyle={styles.gridCardHovered}
              onPress={() => router.push('/(tabs)/game')}
            >
              <Text style={styles.gridCardIcon}>🎮</Text>
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>Jeu</Text>
              <Text style={[styles.gridCardDescription, { color: colors.textSecondary }]}>
                Apprenez en vous amusant avec nos mini-jeux
              </Text>
            </HoverableCard>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.scrollContainer, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Personnalisez votre expérience
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Quelques questions pour adapter les exercices à vos besoins
          </Text>
          
          {/* Indicateur de progression */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressBar,
                  s <= step ? styles.progressBarActive : [styles.progressBarInactive, { backgroundColor: colors.border }]
                ]}
              />
            ))}
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Étape {step} sur 3
          </Text>
        </View>

        {/* Étape 1 : Profil */}
        {step === 1 && (
          <View>
            <Text style={[styles.questionTitle, { color: colors.text }]}>
              Qui êtes-vous ?
            </Text>

            <Pressable
              onPress={() => setProfile('deaf')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                profile === 'deaf' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🦻</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Je suis malentendant(e) ou sourd(e)
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Je veux apprendre le LfPC pour mieux communiquer
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('hearing')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                profile === 'hearing' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>👂</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Je suis entendant(e)
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Je veux apprendre pour communiquer avec une personne sourde
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('family')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                profile === 'family' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>👨‍👩‍👧</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Je suis parent ou proche
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Mon enfant ou un proche est sourd ou malentendant
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('professional')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                profile === 'professional' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💼</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Je suis professionnel(le)
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Enseignant, orthophoniste, éducateur, etc.
              </Text>
            </Pressable>

            <Pressable
              onPress={() => profile && setStep(2)}
              disabled={!profile}
              style={[
                styles.button,
                profile ? styles.buttonPrimary : styles.buttonPrimaryDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                Continuer
              </Text>
            </Pressable>
          </View>
        )}

        {/* Étape 2 : Niveau */}
        {step === 2 && (
          <View>
            <Text style={[styles.questionTitle, { color: colors.text }]}>
              Quel est votre niveau en LfPC ?
            </Text>

            <Pressable
              onPress={() => setLevel('beginner')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                level === 'beginner' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌱</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Débutant
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Je découvre le LfPC, je n'ai jamais pratiqué
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLevel('intermediate')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                level === 'intermediate' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌿</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Intermédiaire
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Je connais les bases, je veux me perfectionner
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLevel('advanced')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                level === 'advanced' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌳</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Avancé
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Je maîtrise le LfPC, je veux approfondir mes compétences
              </Text>
            </Pressable>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() => setStep(1)}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Retour
                </Text>
              </Pressable>

              <Pressable
                onPress={() => level && setStep(3)}
                disabled={!level}
                style={[
                  styles.button,
                  level ? styles.buttonPrimary : styles.buttonPrimaryDisabled
                ]}
              >
                <Text style={styles.buttonText}>
                  Continuer
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Étape 3 : Objectifs */}
        {step === 3 && (
          <View>
            <Text style={[styles.questionTitle, { color: colors.text }]}>
              Quel est votre objectif principal ?
            </Text>

            <Pressable
              onPress={() => setGoal('communication')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                goal === 'communication' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💬</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Communication quotidienne
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Échanger au quotidien avec mes proches
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('professional')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                goal === 'professional' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💼</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Usage professionnel
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Utiliser le LfPC dans mon travail
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('family')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                goal === 'family' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>❤️</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Accompagnement familial
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Aider un enfant ou un proche dans son apprentissage
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('curiosity')}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                goal === 'curiosity' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🔍</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Curiosité et découverte
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Découvrir une nouvelle forme de communication
              </Text>
            </Pressable>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() => setStep(2)}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Retour
                </Text>
              </Pressable>

              <Pressable
                onPress={saveOnboarding}
                disabled={!goal}
                style={[
                  styles.button,
                  goal ? styles.buttonPrimary : styles.buttonPrimaryDisabled
                ]}
              >
                <Text style={styles.buttonText}>
                  Terminer
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  completedContent: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#92400E',
  },
  streakLabel: {
    fontSize: 16,
    color: '#78350F',
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  descriptionSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  actionCardPressed: {
    opacity: 0.8,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  actionCardText: {
    fontSize: 15,
    color: '#3B82F6',
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressBarActive: {
    backgroundColor: '#2563EB',
  },
  progressBarInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  optionCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#CBD5E1',
  },
  buttonSecondary: {
    backgroundColor: '#F1F5F9',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#64748B',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  gridCard: {
    width: '32%',
    minWidth: 280,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  gridCardPressed: {
    transform: [{ translateY: -10 }, { scale: 1.02 }],
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
    boxShadow: '0 12px 16px rgba(59, 130, 246, 0.3)',
    elevation: 12,
  },
  gridCardHovered: {
    transform: [{ translateY: -10 }, { scale: 1.02 }],
    borderColor: '#3B82F6',
    boxShadow: '0 12px 16px rgba(59, 130, 246, 0.3)',
    elevation: 12,
  },
  gridCardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgesSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  gridCardDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
