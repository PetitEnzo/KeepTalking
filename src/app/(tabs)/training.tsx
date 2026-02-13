import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
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

type TrainingMode = 'unlimited' | 'thirty' | 'timed';

export default function TrainingScreen() {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [currentWord, setCurrentWord] = useState<TrainingWord | null>(null);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [validatedSyllables, setValidatedSyllables] = useState<number[]>([]);
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const [handPositions, setHandPositions] = useState<HandPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [matchResult, setMatchResult] = useState({ confidence: 0, feedback: 'Placez votre main devant la caméra' });
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [handedness, setHandedness] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [completedWord, setCompletedWord] = useState<string>('');
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [selectedMode, setSelectedMode] = useState<TrainingMode | null>(null);
  const [showImageHelp, setShowImageHelp] = useState(true);
  const [validatedWordsCount, setValidatedWordsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    loadData();
    loadBestScore();
  }, []);

  useEffect(() => {
    if (selectedMode === 'timed' && startTime && !showModeSelection) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        const remaining = 120 - elapsed;
        
        if (remaining <= 0) {
          handleSessionEnd();
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedMode, startTime, showModeSelection]);

  const loadBestScore = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('users_profiles')
        .select('advanced_best_score')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data?.advanced_best_score) {
        setBestScore(data.advanced_best_score);
      }
    } catch (error) {
      console.error('Erreur chargement meilleur score:', error);
    }
  };

  const saveBestScore = async (score: number) => {
    if (!user || score <= bestScore) return;
    
    try {
      await supabase
        .from('users_profiles')
        .upsert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          advanced_best_score: score,
        });
      
      setBestScore(score);
    } catch (error) {
      console.error('Erreur sauvegarde meilleur score:', error);
    }
  };

  const handleDetectionResults = useCallback((landmarks: any, face?: any) => {
    setIsDetecting(true);
    
    if (currentWord && currentSyllableIndex < currentWord.syllables.length) {
      const targetSyllable = currentWord.syllables[currentSyllableIndex];
      const result = matchSyllable(landmarks, targetSyllable, face);
      
      setMatchResult({
        confidence: result.confidence,
        feedback: result.feedback,
      });

      setConfidenceHistory(prev => {
        const newHistory = [...prev, result.confidence].slice(-20);
        
        if (!isValidating && isValidationStable(newHistory, 60, 8)) {
          setIsValidating(true);
          setTimeout(() => handleSyllableValidated(), 0);
        }
        
        return newHistory;
      });
    }
  }, [currentWord, currentSyllableIndex, isValidating]);

  const loadData = async () => {
    try {
      const { data: signsData } = await supabase
        .from('hand_signs')
        .select('configuration_number, consonnes, description, image_url')
        .order('configuration_number', { ascending: true });

      if (signsData) {
        // Mapper pour garder la compatibilité avec l'interface existante
        const mappedSigns = signsData.map((sign: any) => {
          const consonnes: string[] = Array.isArray(sign.consonnes) 
            ? sign.consonnes 
            : sign.consonnes.split(', ').map((c: string) => c.trim());
          return {
            key: consonnes[0],
            image_url: sign.image_url,
          };
        });
        setHandSigns(mappedSigns);
      }

      const { data: positionsData } = await supabase
        .from('hand_positions')
        .select('configuration_number, image_url, description');

      if (positionsData) {
        setHandPositions(positionsData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRandomWord = async () => {
    try {
      const baseWords = trainingWordsData as TrainingWord[];
      
      const { data: approvedWords } = await supabase
        .from('word_contributions')
        .select('contribution_id, word, difficulty, syllables')
        .eq('status', 'approved');
      
      let allWords = [...baseWords];
      
      if (approvedWords && approvedWords.length > 0) {
        const contributedWords: TrainingWord[] = approvedWords.map(w => ({
          id: w.contribution_id,
          word: w.word,
          difficulty: w.difficulty,
          syllables: w.syllables as Syllable[],
        }));
        allWords = [...allWords, ...contributedWords];
      }
      
      const randomIndex = Math.floor(Math.random() * allWords.length);
      setCurrentWord(allWords[randomIndex]);
      setCurrentSyllableIndex(0);
      setValidatedSyllables([]);
      setConfidenceHistory([]);
    } catch (error) {
      console.error('Erreur lors de la sélection du mot:', error);
      const words = trainingWordsData as TrainingWord[];
      const randomIndex = Math.floor(Math.random() * words.length);
      setCurrentWord(words[randomIndex]);
      setCurrentSyllableIndex(0);
      setValidatedSyllables([]);
      setConfidenceHistory([]);
    }
  };

  const handleSyllableValidated = useCallback(() => {
    if (!currentWord) return;

    setValidatedSyllables(prev => {
      if (prev.includes(currentSyllableIndex)) {
        return prev;
      }
      return [...prev, currentSyllableIndex];
    });
    
    setScore(prev => prev + 1);
    setConfidenceHistory([]);

    if (currentSyllableIndex + 1 < currentWord.syllables.length) {
      setTimeout(() => {
        setCurrentSyllableIndex(currentSyllableIndex + 1);
        setIsValidating(false);
      }, 1000);
    } else {
      setTimeout(() => {
        handleWordCompleted();
      }, 800);
    }
  }, [currentWord, currentSyllableIndex]);

  const handleWordCompleted = async () => {
    if (!currentWord || !user) return;
    
    setCompletedWord(currentWord.word);
    setShowSuccessBanner(true);
    
    const newWordsCount = validatedWordsCount + 1;
    setValidatedWordsCount(newWordsCount);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profileData } = await supabase
        .from('users_profiles')
        .select('last_activity_date, current_streak')
        .eq('id', user.id)
        .maybeSingle();

      const lastActivity = profileData?.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = profileData?.current_streak || 0;
      
      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }

      await supabase
        .from('users_profiles')
        .upsert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          last_activity_date: today,
          current_streak: newStreak,
        });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation de la streak:', error);
    }

    if (selectedMode === 'thirty' && newWordsCount >= 30) {
      setTimeout(() => {
        handleSessionEnd();
      }, 800);
    } else {
      setTimeout(() => {
        setCompletedWord('');
        setShowSuccessBanner(false);
        handleNextWord();
      }, 800);
    }
  };

  const handleNextWord = () => {
    setValidatedSyllables([]);
    setCurrentSyllableIndex(0);
    setConfidenceHistory([]);
    setIsValidating(false);
    selectRandomWord();
  };

  const handleSkipWord = () => {
    setValidatedSyllables([]);
    setCurrentSyllableIndex(0);
    setConfidenceHistory([]);
    setIsValidating(false);
    setShowSuccessBanner(false);
    selectRandomWord();
  };

  const handleSkipSyllable = () => {
    if (!currentWord) return;

    if (currentSyllableIndex + 1 < currentWord.syllables.length) {
      setCurrentSyllableIndex(prev => prev + 1);
      setConfidenceHistory([]);
    }
  };

  const handleModeSelection = async (mode: TrainingMode, withImages: boolean) => {
    setSelectedMode(mode);
    setShowImageHelp(withImages);
    setShowModeSelection(false);
    setStartTime(new Date());
    setValidatedWordsCount(0);
    setTimeLeft(120);
    await selectRandomWord();
  };

  const handleSessionEnd = () => {
    if (selectedMode === 'timed') {
      saveBestScore(validatedWordsCount);
    }
    setShowModeSelection(true);
    setSelectedMode(null);
    setValidatedWordsCount(0);
  };

  const handleRestart = () => {
    setShowModeSelection(true);
    setSelectedMode(null);
    setValidatedWordsCount(0);
    setStartTime(null);
    setTimeLeft(120);
  };

  // Mapping des consonnes vers les configurations de main
  const consonneToConfigMap: { [key: string]: string } = {
    'M': 'M', 'T': 'M', 'F': 'M',
    'P': 'P', 'D': 'P', 'J': 'P',
    'B': 'B', 'N': 'B', 'UI': 'B',
    'L': 'L', 'CH': 'L', 'GN': 'L', 'OUI': 'L', 'OU': 'L',
    'K': 'K', 'V': 'K', 'Z': 'K', 'C': 'K',
    'S': 'S', 'R': 'S',
    'G': 'G',
    'ING': 'ING', 'LLE': 'ING', 'ILLE': 'ING',
  };

  const getHandSignImage = (key: string | null) => {
    if (!key || !showImageHelp) return undefined;
    
    // Trouver la configuration correspondante à la consonne
    const configKey = consonneToConfigMap[key] || key;
    const sign = handSigns.find(s => s.key === configKey);
    
    return sign?.image_url;
  };

  const getHandPositionImage = (config: number | null) => {
    if (!config || !showImageHelp) return undefined;
    const position = handPositions.find(p => p.configuration_number === config);
    return position?.image_url;
  };

  const getHandPositionDescription = (config: number | null) => {
    if (!config) return '';
    const position = handPositions.find(p => p.configuration_number === config);
    return position?.description || '';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (showModeSelection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.modeSelectionScroll}>
          <View style={styles.modeSelectionContainer}>
            <Text style={[styles.modeTitle, { color: colors.text }]}>🎯 Entraînement Avancé</Text>
            <Text style={[styles.modeSubtitle, { color: colors.textSecondary }]}>
              Choisissez votre mode d'entraînement
            </Text>

            {bestScore > 0 && (
              <View style={[styles.bestScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.bestScoreLabel, { color: colors.textSecondary }]}>🏆 Meilleur score (2 min)</Text>
                <Text style={[styles.bestScoreValue, { color: colors.primary }]}>{bestScore} mots</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode de jeu</Text>

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.modeCardPressed
              ]}
              onPress={() => handleModeSelection('unlimited', true)}
            >
              <Text style={[styles.modeCardTitle, { color: colors.text }]}>♾️ Illimité</Text>
              <Text style={[styles.modeCardDescription, { color: colors.textSecondary }]}>
                Entraînez-vous sans limite de temps ou de nombre
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.modeCardPressed
              ]}
              onPress={() => handleModeSelection('thirty', true)}
            >
              <Text style={[styles.modeCardTitle, { color: colors.text }]}>🎯 30 Mots</Text>
              <Text style={[styles.modeCardDescription, { color: colors.textSecondary }]}>
                Validez 30 mots complets
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.modeCardPressed
              ]}
              onPress={() => handleModeSelection('timed', true)}
            >
              <Text style={[styles.modeCardTitle, { color: colors.text }]}>⏱️ 2 Minutes</Text>
              <Text style={[styles.modeCardDescription, { color: colors.textSecondary }]}>
                Validez un maximum de mots en 2 minutes
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.modeCardPressed
              ]}
              onPress={() => handleModeSelection('unlimited', false)}
            >
              <Text style={[styles.modeCardTitle, { color: colors.text }]}>🎓 Mode Expert (sans images)</Text>
              <Text style={[styles.modeCardDescription, { color: colors.textSecondary }]}>
                Codez sans aide visuelle - illimité
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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

      <ScrollView style={styles.contentScroll}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            {!isMobile && (
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                🎯 Entraînement Avancé {!showImageHelp && '(Mode Expert)'}
              </Text>
            )}
            <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
              {!isMobile && (
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mots validés</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>{validatedWordsCount}</Text>
                </View>
              )}
              
              {selectedMode === 'thirty' && (
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Objectif</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>30</Text>
                </View>
              )}
              
              {selectedMode === 'timed' && (
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Temps</Text>
                  <Text style={[styles.statValue, { color: timeLeft <= 30 ? colors.error : colors.primary }]}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.mainLayout, isMobile && styles.mainLayoutMobile]}>
            {/* Sur mobile: webcam en premier avec overlay intégré */}
            {isMobile && (
              <View style={styles.mobileWebcamColumn}>
                <WebcamFeedback
                  isDetecting={isDetecting}
                  handedness={handedness}
                  confidence={matchResult.confidence}
                  feedback={matchResult.feedback}
                  onDetection={handleDetectionResults}
                />
              </View>
            )}

            <View style={[styles.leftColumn, isMobile && styles.mobileSyllableColumn]}>
              <View style={[styles.wordCard, isMobile && styles.wordCardMobile, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {!isMobile && <Text style={[styles.wordLabel, { color: colors.textSecondary }]}>Mot à coder</Text>}
                <Text style={[styles.wordText, isMobile && styles.wordTextMobile, { color: colors.text }]}>{currentWord.word}</Text>
                {!isMobile && (
                  <Text style={[styles.wordDecomposition, { color: colors.textSecondary }]}>
                    {currentWord.syllables.map(s => s.text).join(' - ')}
                  </Text>
                )}
              </View>

              {/* Sur mobile: syllabe AVANT progression */}
              <View style={[styles.syllablesList, isMobile && styles.syllablesListMobile]}>
                {currentWord.syllables.map((syllable, index) => {
                  let status: 'pending' | 'current' | 'validated' = 'pending';
                  if (validatedSyllables.includes(index)) {
                    status = 'validated';
                  } else if (index === currentSyllableIndex) {
                    status = 'current';
                  }

                  // Sur mobile: afficher uniquement la syllabe courante (masquer les validées)
                  if (isMobile && status === 'validated') {
                    return null;
                  }

                  // Sur mobile: afficher uniquement la syllabe courante
                  if (isMobile && status !== 'current') {
                    return null;
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

              {/* Stats après la syllabe card sur mobile */}
              {isMobile && (
                <View style={[styles.statCard, styles.statCardMobile, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statLabel, styles.statLabelMobile, { color: colors.textSecondary }]}>Mots validés</Text>
                  <Text style={[styles.statValue, styles.statValueMobile, { color: colors.success }]}>{validatedWordsCount}</Text>
                </View>
              )}

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

                <Pressable 
                  style={[styles.button, { backgroundColor: colors.error }]}
                  onPress={handleRestart}
                >
                  <Text style={styles.buttonText}>🔄 Changer de mode</Text>
                </Pressable>
              </View>
            </View>

            {/* Sur desktop uniquement: webcam + instructions à droite */}
            {!isMobile && (
              <View style={styles.rightColumn}>
                <WebcamFeedback
                  isDetecting={isDetecting}
                  handedness={handedness}
                  confidence={matchResult.confidence}
                  feedback={matchResult.feedback}
                  onDetection={handleDetectionResults}
                />

                <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.instructionsTitle, { color: colors.text }]}>💡 Conseils</Text>
                <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
                  • Placez votre main bien visible{'\n'}
                  • Maintenez la position stable{'\n'}
                  • Bon éclairage requis{'\n'}
                  • Précision minimale : 60%
                </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentMobile: {
    padding: 0,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  modeSelectionScroll: {
    flex: 1,
  },
  modeSelectionContainer: {
    padding: 20,
  },
  modeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modeSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
  },
  bestScoreCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  bestScoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  bestScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modeCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  modeCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modeCardDescription: {
    fontSize: 14,
  },
  successBanner: {
    backgroundColor: '#10B981',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
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
    color: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
  },
  headerMobile: {
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsRowMobile: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  statCardSpacer: {
    height: 0,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statCardMobile: {
    padding: 6,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statLabelMobile: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statValueMobile: {
    fontSize: 18,
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  mainLayoutMobile: {
    flexDirection: 'column',
    gap: 0,
  },
  mobileWebcamColumn: {
    width: '100%',
    marginBottom: 4,
  },
  mobileSyllableColumn: {
    width: '100%',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  wordCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  wordCardMobile: {
    padding: 8,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  wordLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  wordLabelMobile: {
    fontSize: 11,
    marginBottom: 2,
  },
  wordText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wordTextMobile: {
    fontSize: 22,
    marginBottom: 0,
  },
  wordDecomposition: {
    fontSize: 16,
  },
  wordDecompositionMobile: {
    fontSize: 12,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressCardMobile: {
    padding: 6,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressLabelMobile: {
    fontSize: 11,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
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
    textAlign: 'center',
  },
  progressTextMobile: {
    fontSize: 10,
  },
  syllablesList: {
    gap: 12,
    marginBottom: 16,
  },
  syllablesListMobile: {
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  skipButtonsContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonSkip: {
    backgroundColor: '#F59E0B',
  },
  buttonSkipWord: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSkip: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSkipWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
