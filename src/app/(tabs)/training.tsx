import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { matchSyllable, isValidationStable } from '../../utils/syllableMatcher';
import SyllableCard from '../../components/training/SyllableCard';
import WebcamFeedback from '../../components/training/WebcamFeedback';
import trainingWordsData from '../../data/trainingWords.json';

interface Syllable {
  text: string;
  consonne: string | null;
  voyelle: string | null;
  hand_sign_key: string | null;
  hand_position_config: number | null;
  description: string;
}

interface TrainingWord {
  id: number | string;
  word: string;
  difficulty: string;
  syllables: Syllable[];
}

interface HandSign {
  key: string;
  image_url: string;
}

interface HandPosition {
  configuration_number: number;
  image_url: string;
  description: string;
}

export default function TrainingScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [currentWord, setCurrentWord] = useState<TrainingWord | null>(null);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [validatedSyllables, setValidatedSyllables] = useState<number[]>([]);
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const [handPositions, setHandPositions] = useState<HandPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // État pour la détection
  const [matchResult, setMatchResult] = useState({
    confidence: 0,
    feedback: 'Placez votre main devant la caméra',
  });
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [handedness, setHandedness] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false); // Flag pour empêcher les validations multiples
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [completedWord, setCompletedWord] = useState<string>('');

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Callback pour recevoir les résultats de détection de WebcamFeedback
  const handleDetectionResults = useCallback((landmarks: any, face?: any) => {
    setIsDetecting(true);
    
    if (currentWord && currentSyllableIndex < currentWord.syllables.length) {
      const targetSyllable = currentWord.syllables[currentSyllableIndex];
      
      // Passer le visage à matchSyllable pour position relative
      const result = matchSyllable(landmarks, targetSyllable, face);
      
      setMatchResult({
        confidence: result.confidence,
        feedback: result.feedback,
      });

      // Ajouter à l'historique de confiance et vérifier la validation
      setConfidenceHistory(prev => {
        const newHistory = [...prev, result.confidence].slice(-20);
        
        // Vérifier si la validation est stable (8 détections à 60% = 0.8 seconde avec throttle 100ms)
        // Plus strict pour éviter les validations fantômes et s'assurer que la main est stable
        if (!isValidating && isValidationStable(newHistory, 60, 8)) {
          console.log('✅ Syllabe validée! Index:', currentSyllableIndex, 'isValidating:', isValidating);
          setIsValidating(true);
          // Utiliser setTimeout pour éviter les problèmes de state
          setTimeout(() => handleSyllableValidated(), 0);
        }
        
        return newHistory;
      });
    }
  }, [currentWord, currentSyllableIndex, isValidating]);

  const loadData = async () => {
    try {
      // Charger les hand_signs
      const { data: signsData } = await supabase
        .from('hand_signs')
        .select('key, image_url')
        .eq('type', 'consonne');

      if (signsData) {
        console.log('🖐️ Configurations de main chargées:', signsData);
        setHandSigns(signsData);
      }

      // Charger les hand_positions
      const { data: positionsData } = await supabase
        .from('hand_positions')
        .select('configuration_number, image_url, description');

      if (positionsData) {
        setHandPositions(positionsData);
      }

      // Sélectionner un mot aléatoire (incluant les mots approuvés)
      await selectRandomWord();
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRandomWord = async () => {
    try {
      // Charger les mots de base depuis le JSON
      const baseWords = trainingWordsData as TrainingWord[];
      
      // Charger les mots approuvés depuis word_contributions
      const { data: approvedWords } = await supabase
        .from('word_contributions')
        .select('contribution_id, word, difficulty, syllables')
        .eq('status', 'approved');
      
      // Combiner les deux sources de mots
      let allWords = [...baseWords];
      
      if (approvedWords && approvedWords.length > 0) {
        console.log('✅ Mots approuvés trouvés:', approvedWords);
        const contributedWords: TrainingWord[] = approvedWords.map(w => ({
          id: w.contribution_id,
          word: w.word,
          difficulty: w.difficulty,
          syllables: w.syllables as Syllable[],
        }));
        allWords = [...allWords, ...contributedWords];
        console.log(`📚 ${allWords.length} mots disponibles (${baseWords.length} de base + ${contributedWords.length} contribués)`);
      } else {
        console.log('⚠️ Aucun mot approuvé trouvé dans word_contributions');
      }
      
      // Sélectionner un mot aléatoire
      const randomIndex = Math.floor(Math.random() * allWords.length);
      setCurrentWord(allWords[randomIndex]);
      setCurrentSyllableIndex(0);
      setValidatedSyllables([]);
      setSessionComplete(false);
      setScore(0);
      setStartTime(new Date());
      setConfidenceHistory([]);
    } catch (error) {
      console.error('Erreur lors de la sélection du mot:', error);
      // Fallback sur les mots de base en cas d'erreur
      const words = trainingWordsData as TrainingWord[];
      const randomIndex = Math.floor(Math.random() * words.length);
      setCurrentWord(words[randomIndex]);
      setCurrentSyllableIndex(0);
      setValidatedSyllables([]);
      setSessionComplete(false);
      setScore(0);
      setStartTime(new Date());
      setConfidenceHistory([]);
    }
  };

  const handleSyllableValidated = useCallback(() => {
    if (!currentWord) return;

    console.log('📝 handleSyllableValidated appelé pour syllabe:', currentSyllableIndex);

    // Vérifier si la syllabe n'est pas déjà validée (prévenir les doublons)
    setValidatedSyllables(prev => {
      if (prev.includes(currentSyllableIndex)) {
        console.log('⚠️ Syllabe déjà validée, ignoré');
        return prev;
      }
      const newValidated = [...prev, currentSyllableIndex];
      console.log('✅ Syllabes validées:', newValidated, '/', currentWord.syllables.length);
      return newValidated;
    });
    
    setScore(prev => prev + 1);
    setConfidenceHistory([]);

    // Passer à la syllabe suivante ou terminer
    if (currentSyllableIndex + 1 < currentWord.syllables.length) {
      console.log('➡️ Passage à la syllabe suivante dans 1 seconde...');
      setTimeout(() => {
        console.log('🔄 Changement syllabe:', currentSyllableIndex, '->', currentSyllableIndex + 1);
        setCurrentSyllableIndex(currentSyllableIndex + 1);
        setIsValidating(false); // Réactiver la validation pour la prochaine syllabe
        console.log('🔓 isValidating réinitialisé à false');
      }, 1000);
    } else {
      // Toutes les syllabes validées
      console.log('🎉 Toutes les syllabes validées! Mot terminé.');
      setTimeout(() => {
        handleWordCompleted();
      }, 1500);
    }
  }, [currentWord, currentSyllableIndex]);

  const handleWordCompleted = async () => {
    if (!currentWord || !user) return;
    
    // Sauvegarder le mot complété pour l'affichage
    setCompletedWord(currentWord.word);
    
    // Afficher le bandeau de succès
    setShowSuccessBanner(true);
    
    // Mettre à jour le streak dans Supabase
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profileData } = await supabase
        .from('users_profiles')
        .select('last_activity_date, current_streak')
        .eq('id', user.id)
        .single();

      const lastActivity = profileData?.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = profileData?.current_streak || 0;
      
      // Si la dernière activité était hier, on incrémente
      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } 
      // Si la dernière activité n'était pas aujourd'hui, on recommence à 1
      else if (lastActivity !== today) {
        newStreak = 1;
      }
      // Si c'est déjà aujourd'hui, on garde le streak actuel (pas d'incrémentation)

      console.log('📊 Mise à jour streak:', { lastActivity, today, yesterdayStr, currentStreak: profileData?.current_streak, newStreak });

      const { error: streakError } = await supabase
        .from('users_profiles')
        .upsert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          last_activity_date: today,
          current_streak: newStreak,
        });

      if (streakError) {
        console.error('❌ Erreur streak:', streakError);
      } else {
        console.log('✅ Streak mis à jour:', newStreak);
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation de la streak:', error);
    }
    
    // Passer automatiquement au mot suivant après 3 secondes
    setTimeout(() => {
      setShowSuccessBanner(false);
      handleNextWord();
    }, 3000);
  };

  const handleNextWord = () => {
    // Réinitialiser les états SANS fermer la webcam
    setValidatedSyllables([]);
    setCurrentSyllableIndex(0);
    setConfidenceHistory([]);
    setSessionComplete(false);
    setIsValidating(false);
    
    // Passer au mot suivant
    selectRandomWord();
  };

  const handleSkipWord = () => {
    // Passer au mot suivant SANS donner d'XP ni faire progresser la streak
    console.log('⏭️ Mot passé (pas d\'XP, pas de streak)');
    setValidatedSyllables([]);
    setCurrentSyllableIndex(0);
    setConfidenceHistory([]);
    setSessionComplete(false);
    setIsValidating(false);
    setShowSuccessBanner(false);
    
    // Passer au mot suivant
    selectRandomWord();
  };

  const handleReplayWord = () => {
    setCurrentSyllableIndex(0);
    setValidatedSyllables([]);
    setSessionComplete(false);
    setScore(0);
    setStartTime(new Date());
    setConfidenceHistory([]);
  };

  const handleSkipSyllable = () => {
    if (!currentWord) return;

    if (currentSyllableIndex + 1 < currentWord.syllables.length) {
      setCurrentSyllableIndex(prev => prev + 1);
      setConfidenceHistory([]);
    }
  };

  const getHandSignImage = (key: string | null) => {
    if (!key) return undefined;
    const sign = handSigns.find(s => s.key === key);
    return sign?.image_url;
  };

  const getHandPositionImage = (config: number | null) => {
    if (!config) return undefined;
    const position = handPositions.find(p => p.configuration_number === config);
    return position?.image_url;
  };

  const getHandPositionDescription = (config: number | null) => {
    if (!config) return '';
    const position = handPositions.find(p => p.configuration_number === config);
    return position?.description || '';
  };

  const getElapsedTime = () => {
    if (!startTime) return '0s';
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Aucun mot disponible</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bandeau de succès */}
      {showSuccessBanner && (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerEmoji}>🎉</Text>
          <View style={styles.successBannerContent}>
            <Text style={styles.successBannerTitle}>Mot complété !</Text>
            <Text style={styles.successBannerText}>
              "{completedWord}" validé • Passage au mot suivant...
            </Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🎯 Entraînement Reconnaissance</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Reproduisez les configurations LFPC avec votre main
          </Text>
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>✨</Text>
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
              Le système détecte votre visage et vos mains en temps réel ! Formez la bonne configuration de main et placez-la aux positions indiquées (Œil, Écart, Bouche, Menton, Cou) pour former les syllabes.
            </Text>
          </View>
        </View>

        {/* Layout 2 colonnes */}
        <View style={styles.mainLayout}>
          {/* Colonne gauche - Syllabes */}
          <View style={styles.leftColumn}>
            <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.wordLabel, { color: colors.textSecondary }]}>Mot à coder</Text>
              <Text style={[styles.wordText, { color: colors.text }]}>{currentWord.word}</Text>
              <Text style={styles.wordDecomposition}>
                {currentWord.syllables.map(s => s.text).join(' - ')}
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Progression</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(validatedSyllables.length / currentWord.syllables.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {validatedSyllables.length} / {currentWord.syllables.length} syllabes
              </Text>
            </View>

            <View style={styles.syllablesList}>
              {currentWord.syllables.map((syllable, index) => {
                let status: 'pending' | 'current' | 'validated' = 'pending';
                if (validatedSyllables.includes(index)) {
                  status = 'validated';
                } else if (index === currentSyllableIndex) {
                  status = 'current';
                }

                return (
                  <SyllableCard
                    key={index}
                    syllable={syllable}
                    status={status}
                    handSignImage={getHandSignImage(syllable.hand_sign_key)}
                    handPositionImage={getHandPositionImage(syllable.hand_position_config)}
                    handPositionDescription={getHandPositionDescription(syllable.hand_position_config)}
                  />
                );
              })}
            </View>

            <View style={styles.skipButtonsContainer}>
              <Pressable 
                style={[styles.button, styles.buttonSkip]}
                onPress={handleSkipSyllable}
              >
                <Text style={styles.buttonTextSkip}>⏭️ Passer la syllabe</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.button, styles.buttonSkipWord]}
                onPress={handleSkipWord}
              >
                <Text style={styles.buttonTextSkipWord}>⏩ Passer le mot</Text>
              </Pressable>
            </View>
          </View>

          {/* Colonne droite - Webcam */}
          <View style={styles.rightColumn}>
            <WebcamFeedback
              isDetecting={isDetecting}
              handedness={handedness}
              confidence={matchResult.confidence}
              feedback={matchResult.feedback}
              onDetection={handleDetectionResults}
            />

            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>💡 Conseils</Text>
              <Text style={styles.instructionsText}>
                • Placez votre main bien visible devant la caméra{'\n'}
                • Maintenez la position stable pendant 1 seconde{'\n'}
                • Assurez-vous d'avoir un bon éclairage{'\n'}
                • La barre de précision doit atteindre 80%
              </Text>
            </View>

            <View style={styles.orientationCard}>
              <Text style={styles.orientationIcon}>🖐️</Text>
              <Text style={styles.orientationText}>
                Codez toujours avec l'intérieur de la main vers vous
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  successBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successBannerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  successBannerContent: {
    flex: 1,
  },
  successBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successBannerText: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoBannerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    flex: 1,
  },
  leftColumn: {
    flex: 3,
    minWidth: 300,
  },
  rightColumn: {
    flex: 2,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  wordLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  wordDecomposition: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  syllablesList: {
    marginBottom: 16,
    flex: 1,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  buttonSkip: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonTextSkip: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  skipButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  buttonSkipWord: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  buttonTextSkipWord: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
  },
  orientationCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  orientationIcon: {
    fontSize: 24,
  },
  orientationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B21A8',
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 40,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successWord: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  successButtons: {
    flexDirection: 'row',
    gap: 16,
  },
});
