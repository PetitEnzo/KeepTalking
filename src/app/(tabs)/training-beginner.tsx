import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';
import WebcamFeedback from '../../components/training/WebcamFeedback';
import { estimateHandConfiguration } from '../../utils/syllableMatcher';

interface HandSign {
  configuration_number: number;
  consonnes: string;
  description: string;
  image_url: string;
}

type TrainingMode = 'unlimited' | 'thirty' | 'timed';

export default function TrainingBeginnerScreen() {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const [currentSign, setCurrentSign] = useState<HandSign | null>(null);
  const [validatedCount, setValidatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [matchResult, setMatchResult] = useState({ confidence: 0, feedback: '' });
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [selectedMode, setSelectedMode] = useState<TrainingMode | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bestScore, setBestScore] = useState(0);
  const [showImageHelp, setShowImageHelp] = useState(true);

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

  const loadData = async () => {
    try {
      const { data: signsData } = await supabase
        .from('hand_signs')
        .select('configuration_number, consonnes, description, image_url')
        .order('configuration_number', { ascending: true });

      if (signsData) {
        setHandSigns(signsData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBestScore = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('users_profiles')
        .select('beginner_best_score')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data?.beginner_best_score) {
        setBestScore(data.beginner_best_score);
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
          beginner_best_score: score,
        });
      
      setBestScore(score);
    } catch (error) {
      console.error('Erreur sauvegarde meilleur score:', error);
    }
  };

  const selectRandomSign = () => {
    if (handSigns.length === 0) return;
    const randomIndex = Math.floor(Math.random() * handSigns.length);
    setCurrentSign(handSigns[randomIndex]);
    setConfidenceHistory([]);
    setIsValidating(false);
  };

  const handleModeSelection = (mode: TrainingMode, withImages: boolean) => {
    setSelectedMode(mode);
    setShowImageHelp(withImages);
    setShowModeSelection(false);
    setStartTime(new Date());
    setValidatedCount(0);
    setTimeLeft(120);
    selectRandomSign();
  };

  const handleDetectionResults = useCallback((landmarks: any) => {
    if (!currentSign) return;
    
    if (!landmarks || landmarks.length !== 21) {
      setIsDetecting(false);
      setMatchResult({
        confidence: 0,
        feedback: 'Placez votre main devant la caméra',
      });
      return;
    }

    setIsDetecting(true);

    // Normaliser les landmarks
    const normalizedLandmarks = landmarks.map((landmark: any) => {
      if (Array.isArray(landmark)) {
        return { x: landmark[0], y: landmark[1], z: landmark[2] || 0 };
      }
      return landmark;
    });

    // Utiliser la fonction d'estimation de configuration
    const configResult: any = estimateHandConfiguration(normalizedLandmarks);
    
    if (!configResult || !configResult.config) {
      console.log('❌ Aucune configuration détectée');
      setMatchResult({
        confidence: 0,
        feedback: 'Main non détectée correctement',
      });
      return;
    }

    // Vérifier si la configuration correspond à la cible
    const targetConsonnes = currentSign.consonnes.split(', ').map(c => c.trim());
    const detectedConfig: string = configResult.config.trim();
    const detectionConfidence: number = configResult.confidence;

    console.log(`🖐️ Détecté: "${detectedConfig}" | Cible: Configuration ${currentSign.configuration_number} (${currentSign.consonnes}) | Confiance détection: ${detectionConfidence}%`);

    // Vérifier si la configuration détectée est dans le groupe de consonnes cibles
    const isMatch = targetConsonnes.includes(detectedConfig);
    
    console.log(`🔍 DEBUG: detectedConfig="${detectedConfig}", targetConsonnes=${JSON.stringify(targetConsonnes)}, isMatch=${isMatch}`);

    // Calculer la confiance basée sur la correspondance
    let confidence = 0;
    if (isMatch) {
      console.log(`✅ Match: ${detectedConfig} dans ${JSON.stringify(targetConsonnes)}`);
      confidence = detectionConfidence;
    } else {
      console.log(`❌ Pas de match: ${detectedConfig} pas dans ${JSON.stringify(targetConsonnes)}`);
      confidence = 0;
    }

    console.log(`✅ Confiance finale: ${confidence}%`);
    
    setMatchResult({
      confidence,
      feedback: confidence > 60 ? `Bonne configuration !` : `Détecté: ${detectedConfig} | Cible: ${targetConsonnes.join(', ')}`,
    });

    setConfidenceHistory(prev => {
      const newHistory = [...prev, confidence].slice(-10);
      
      if (!isValidating && newHistory.length >= 8 && newHistory.slice(-8).every(c => c > 60)) {
        setIsValidating(true);
        setTimeout(() => handleSignValidated(), 0);
      }
      
      return newHistory;
    });
  }, [currentSign, isValidating]);

  const handleSignValidated = () => {
    const newCount = validatedCount + 1;
    setValidatedCount(newCount);

    if (selectedMode === 'thirty' && newCount >= 30) {
      handleSessionEnd();
    } else {
      setTimeout(() => {
        selectRandomSign();
      }, 500);
    }
  };

  const handleSessionEnd = () => {
    if (selectedMode === 'timed') {
      saveBestScore(validatedCount);
    }
    setShowModeSelection(true);
    setSelectedMode(null);
    setValidatedCount(0);
  };

  const handleRestart = () => {
    setShowModeSelection(true);
    setSelectedMode(null);
    setValidatedCount(0);
    setStartTime(null);
    setTimeLeft(120);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (handSigns.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Aucune configuration disponible</Text>
      </View>
    );
  }

  if (showModeSelection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.modeSelectionScroll}>
          <View style={styles.modeSelectionContainer}>
            <Text style={[styles.modeTitle, { color: colors.text }]}>🖐️ Entraînement Débutant</Text>
            <Text style={[styles.modeSubtitle, { color: colors.textSecondary }]}>
              Choisissez votre mode d'entraînement
            </Text>

            {bestScore > 0 && (
              <View style={[styles.bestScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.bestScoreLabel, { color: colors.textSecondary }]}>🏆 Meilleur score (2 min)</Text>
                <Text style={[styles.bestScoreValue, { color: colors.primary }]}>{bestScore} signes</Text>
              </View>
            )}

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
              <Text style={[styles.modeCardTitle, { color: colors.text }]}>🎯 30 Signes</Text>
              <Text style={[styles.modeCardDescription, { color: colors.textSecondary }]}>
                Validez 30 configurations de main
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
                Validez un maximum de signes en 2 minutes
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

  if (!currentSign) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Erreur de chargement</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.contentScroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              🖐️ Entraînement Débutant {!showImageHelp && '(Mode Expert)'}
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Validés</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{validatedCount}</Text>
              </View>
              
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

          <View style={styles.mainLayout}>
            <View style={styles.leftColumn}>
              <View style={[
                styles.currentSignCard, 
                { 
                  backgroundColor: matchResult.confidence > 60 
                    ? (theme === 'dark' ? '#065f46' : '#D1FAE5')
                    : colors.card,
                  borderColor: matchResult.confidence > 60 ? '#10B981' : colors.border
                }
              ]}>
                <Text style={[styles.currentSignLabel, { color: colors.textSecondary }]}>
                  Configuration à reproduire
                </Text>
                <Text style={[styles.currentSignKey, { color: colors.text }]}>
                  {currentSign.consonnes}
                </Text>
                <Text style={[styles.configDescription, { color: colors.textSecondary }]}>
                  {currentSign.description}
                </Text>
                
                {showImageHelp && currentSign.image_url && (
                  <View style={[styles.signImageContainer, { backgroundColor: colors.background }]}>
                    <Image 
                      source={{ uri: currentSign.image_url }}
                      style={styles.signImage}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                  Reproduisez cette configuration avec votre main devant la caméra
                </Text>
              </View>

              <Pressable 
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={handleRestart}
              >
                <Text style={styles.buttonText}>
                  🔄 Changer de mode
                </Text>
              </Pressable>
            </View>

            <View style={styles.rightColumn}>
              <WebcamFeedback
                isDetecting={isDetecting}
                handedness={null}
                confidence={matchResult.confidence}
                feedback={matchResult.feedback}
                onDetection={handleDetectionResults}
                detectFace={false}
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
  header: {
    marginBottom: 20,
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
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  currentSignCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  currentSignLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  currentSignKey: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  configDescription: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  signImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signImage: {
    width: '100%',
    height: '100%',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
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
