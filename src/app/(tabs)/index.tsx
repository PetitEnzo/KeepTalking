import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { router } from 'expo-router';

type UserProfile = 'deaf' | 'hearing' | 'family' | 'professional' | null;
type UserLevel = 'beginner' | 'intermediate' | 'advanced' | null;
type UserGoal = 'communication' | 'professional' | 'family' | 'curiosity' | null;

export default function HomeScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

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
        .select('user_profile, user_level, user_goal')
        .eq('auth_user_id', user.id)
        .single();

      if (data && data.user_profile) {
        setHasCompletedOnboarding(true);
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
        .from('users_profiles')
        .select('current_streak')
        .eq('id', user.id)
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    return (
      <ScrollView style={styles.completedContainer}>
        <View style={styles.completedContent}>
          <Text style={styles.welcomeTitle}>
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

          {/* Bannière d'avertissement */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Application en développement</Text>
              <Text style={styles.warningText}>
                Cette application est un complément d'apprentissage et ne remplace pas les cours de LFPC. Des erreurs peuvent être présentes. N'hésitez pas à nous signaler tout problème !
              </Text>
            </View>
          </View>
        
          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed
            ]}
            onPress={() => router.push('/(tabs)/lessons')}
          >
            <Text style={styles.actionCardTitle}>
              📚 Commencez votre apprentissage
            </Text>
            <Text style={styles.actionCardText}>
              Explorez les leçons adaptées à votre niveau
            </Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: '#FAF5FF' },
              pressed && styles.actionCardPressed
            ]}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={[styles.actionCardTitle, { color: '#581C87' }]}>
              💬 Traduisez avec le chatbot
            </Text>
            <Text style={[styles.actionCardText, { color: '#7C3AED' }]}>
              Traduisez vos mots en LFPC avec l'assistant intelligent
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Personnalisez votre expérience
          </Text>
          <Text style={styles.headerSubtitle}>
            Quelques questions pour adapter les exercices à vos besoins
          </Text>
          
          {/* Indicateur de progression */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressBar,
                  s <= step ? styles.progressBarActive : styles.progressBarInactive
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepText}>
            Étape {step} sur 3
          </Text>
        </View>

        {/* Étape 1 : Profil */}
        {step === 1 && (
          <View>
            <Text style={styles.questionTitle}>
              Qui êtes-vous ?
            </Text>

            <Pressable
              onPress={() => setProfile('deaf')}
              style={[
                styles.optionCard,
                profile === 'deaf' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🦻</Text>
              <Text style={styles.optionTitle}>
                Je suis malentendant(e) ou sourd(e)
              </Text>
              <Text style={styles.optionDescription}>
                Je veux apprendre le LfPC pour mieux communiquer
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('hearing')}
              style={[
                styles.optionCard,
                profile === 'hearing' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>👂</Text>
              <Text style={styles.optionTitle}>
                Je suis entendant(e)
              </Text>
              <Text style={styles.optionDescription}>
                Je veux apprendre pour communiquer avec une personne sourde
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('family')}
              style={[
                styles.optionCard,
                profile === 'family' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.optionTitle}>
                Je suis parent ou proche
              </Text>
              <Text style={styles.optionDescription}>
                Mon enfant ou un proche est sourd ou malentendant
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setProfile('professional')}
              style={[
                styles.optionCard,
                profile === 'professional' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💼</Text>
              <Text style={styles.optionTitle}>
                Je suis professionnel(le)
              </Text>
              <Text style={styles.optionDescription}>
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
            <Text style={styles.questionTitle}>
              Quel est votre niveau en LfPC ?
            </Text>

            <Pressable
              onPress={() => setLevel('beginner')}
              style={[
                styles.optionCard,
                level === 'beginner' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌱</Text>
              <Text style={styles.optionTitle}>
                Débutant
              </Text>
              <Text style={styles.optionDescription}>
                Je découvre le LfPC, je n'ai jamais pratiqué
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLevel('intermediate')}
              style={[
                styles.optionCard,
                level === 'intermediate' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌿</Text>
              <Text style={styles.optionTitle}>
                Intermédiaire
              </Text>
              <Text style={styles.optionDescription}>
                Je connais les bases, je veux me perfectionner
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLevel('advanced')}
              style={[
                styles.optionCard,
                level === 'advanced' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🌳</Text>
              <Text style={styles.optionTitle}>
                Avancé
              </Text>
              <Text style={styles.optionDescription}>
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
            <Text style={styles.questionTitle}>
              Quel est votre objectif principal ?
            </Text>

            <Pressable
              onPress={() => setGoal('communication')}
              style={[
                styles.optionCard,
                goal === 'communication' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💬</Text>
              <Text style={styles.optionTitle}>
                Communication quotidienne
              </Text>
              <Text style={styles.optionDescription}>
                Échanger au quotidien avec mes proches
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('professional')}
              style={[
                styles.optionCard,
                goal === 'professional' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>💼</Text>
              <Text style={styles.optionTitle}>
                Usage professionnel
              </Text>
              <Text style={styles.optionDescription}>
                Utiliser le LfPC dans mon travail
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('family')}
              style={[
                styles.optionCard,
                goal === 'family' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>❤️</Text>
              <Text style={styles.optionTitle}>
                Accompagnement familial
              </Text>
              <Text style={styles.optionDescription}>
                Aider un enfant ou un proche dans son apprentissage
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGoal('curiosity')}
              style={[
                styles.optionCard,
                goal === 'curiosity' && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionEmoji}>🔍</Text>
              <Text style={styles.optionTitle}>
                Curiosité et découverte
              </Text>
              <Text style={styles.optionDescription}>
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
});
