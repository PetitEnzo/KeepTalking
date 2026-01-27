import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';

interface HandSign {
  key: string;
  label: string;
  description: string;
  image_url: string;
  consonnes: string[];
}

export default function GameScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const [currentSign, setCurrentSign] = useState<HandSign | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [answeredSigns, setAnsweredSigns] = useState<Set<string>>(new Set());
  const [bestScore, setBestScore] = useState<number>(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadHandSigns();
    loadBestScore();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    if (gameOver && score > 0) {
      saveBestScore(score);
    }
  }, [gameOver]);

  const loadHandSigns = async () => {
    try {
      const { data, error } = await supabase
        .from('hand_signs')
        .select('*')
        .eq('type', 'consonne');

      if (!error && data) {
        console.log('🔍 Données brutes depuis Supabase:', data);
        
        // Mapping hardcodé des configurations avec leurs consonnes exactes
        const configMapping: { [key: string]: string[] } = {
          'config1.jpg': ['M', 'T', 'F'],
          'config2.jpg': ['J', 'D', 'P'],
          'config3.jpg': ['B', 'N', 'UI'],
          'config4.jpg': ['CH', 'OU', 'L', 'GN'],
          'config5.jpg': ['K', 'Z', 'V'],
          'config6.jpg': ['S', 'R'],
          'config7.jpg': ['G'],
          'config8.jpg': ['ING', 'LLE'],
        };
        
        const signs: HandSign[] = data.map((sign: any) => {
          // Extraire le nom du fichier depuis l'URL
          const imageFileName = sign.image_url.split('/').pop();
          const consonnes = configMapping[imageFileName] || [];
          
          console.log(`📋 Image: ${imageFileName} | Description: "${sign.description}" | Consonnes valides:`, consonnes);
          
          return {
            key: sign.key,
            label: sign.label,
            description: sign.description,
            image_url: sign.image_url,
            consonnes: consonnes,
          };
        });
        setHandSigns(signs);
        console.log('✅ Hand signs chargés:', signs.length);
      }
    } catch (error) {
      console.error('Erreur chargement hand_signs:', error);
    }
  };

  const loadBestScore = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setBestScore(data.score);
      }
    } catch (error) {
      console.log('Pas de meilleur score encore');
    }
  };

  const saveBestScore = async (finalScore: number) => {
    if (!user) return;

    try {
      if (finalScore > bestScore) {
        const { error } = await supabase
          .from('game_scores')
          .insert({
            user_id: user.id,
            score: finalScore,
            played_at: new Date().toISOString(),
          });

        if (!error) {
          setBestScore(finalScore);
        }
      }

      // Mettre à jour le streak après chaque partie
      await updateStreak();
    } catch (error) {
      console.error('Erreur sauvegarde score:', error);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

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
      // Si c'est déjà aujourd'hui, on ne change rien

      console.log('📊 Mise à jour streak (jeu):', { lastActivity, today, yesterdayStr, newStreak });

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
      console.error('❌ Exception streak:', error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setAnsweredSigns(new Set());
    setFeedback(null);
    pickRandomSign();
  };

  const pickRandomSign = () => {
    if (handSigns.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * handSigns.length);
    setCurrentSign(handSigns[randomIndex]);
    setUserInput('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!currentSign || !userInput.trim()) return;

    // Normaliser l'input en majuscules pour la comparaison
    const normalizedInput = userInput.trim().toUpperCase();
    
    // Créer la liste de toutes les réponses valides en majuscules
    const allValidAnswers = [
      ...currentSign.consonnes.map(c => c.toUpperCase()),
    ];
    
    console.log('Input:', normalizedInput);
    console.log('Valid answers:', allValidAnswers);
    
    const isCorrect = allValidAnswers.includes(normalizedInput);

    if (isCorrect) {
      setScore(score + 1);
      setFeedback({
        message: 'Correct !',
        isCorrect: true,
      });
      setUserInput('');
      
      setTimeout(() => {
        pickRandomSign();
        inputRef.current?.focus();
      }, 500);
    } else {
      setFeedback({
        message: 'Incorrect',
        isCorrect: false,
      });
      setUserInput('');
      
      setTimeout(() => {
        setFeedback(null);
        inputRef.current?.focus();
      }, 1000);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      checkAnswer();
    }
  };

  if (!gameStarted) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>🎮 Jeu des Configurations</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Testez vos connaissances des 8 configurations de main du LFPC !
          </Text>

          {bestScore > 0 && (
            <View style={[styles.bestScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.bestScoreLabel, { color: colors.textSecondary }]}>🏆 Meilleur score</Text>
              <Text style={[styles.bestScoreValue, { color: colors.text }]}>{bestScore}</Text>
            </View>
          )}

          <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.rulesTitle, { color: colors.text }]}>📋 Règles du jeu</Text>
            <Text style={[styles.rulesText, { color: colors.textSecondary }]}>
              • Une image de configuration apparaît{'\n'}
              • Vous avez 60 secondes pour deviner un maximum de consonnes{'\n'}
              • Tapez une des consonnes associées à la configuration{'\n'}
              • Chaque bonne réponse rapporte 1 point{'\n'}
              • Les configurations changent automatiquement après une bonne réponse
            </Text>
          </View>

          <Pressable 
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>🚀 Commencer le jeu</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (gameOver) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>🏁 Partie terminée !</Text>
          
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.finalScoreLabel, { color: colors.textSecondary }]}>Votre score</Text>
            <Text style={[styles.finalScore, { color: colors.text }]}>{score}</Text>
            <Text style={[styles.finalScoreSubtext, { color: colors.textSecondary }]}>
              {score === 0 ? 'Continuez à pratiquer !' :
               score < 5 ? 'Bon début !' :
               score < 10 ? 'Bien joué !' :
               score < 15 ? 'Excellent !' :
               'Incroyable ! 🎉'}
            </Text>
          </View>

          <Pressable 
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>🔄 Rejouer</Text>
          </Pressable>

          <Pressable 
            style={[styles.startButton, styles.secondaryButton]}
            onPress={() => {
              setGameStarted(false);
              setGameOver(false);
            }}
          >
            <Text style={[styles.startButtonText, styles.secondaryButtonText]}>
              ← Retour au menu
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header avec timer et score */}
        <View style={styles.gameHeader}>
          <View style={[styles.timerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>⏱️ Temps</Text>
            <Text style={[
              styles.timerValue,
              timeLeft <= 10 && styles.timerWarning
            ]}>
              {timeLeft}s
            </Text>
          </View>
          
          <View style={[styles.scoreBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>🏆 Score</Text>
            <Text style={[styles.scoreValue, { color: colors.text }]}>{score}</Text>
          </View>
        </View>

        {/* Image de la configuration */}
        {currentSign && (
          <View style={[styles.signCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
              <Image 
                source={{ uri: currentSign.image_url }}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.signDescription, { color: colors.textSecondary }]}>{currentSign.description}</Text>
          </View>
        )}

        {/* Input et validation */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Tapez une consonne :
          </Text>
          <TextInput
            ref={inputRef}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={userInput}
            onChangeText={setUserInput}
            onKeyPress={handleKeyPress}
            placeholder="Ex: M, CH, ING..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
            maxLength={3}
          />
          <Pressable 
            style={styles.validateButton}
            onPress={checkAnswer}
          >
            <Text style={styles.validateButtonText}>✓ Valider</Text>
          </Pressable>
        </View>

        {/* Feedback */}
        {feedback && (
          <View style={[
            styles.feedbackBox,
            feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
          ]}>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        )}
      </View>
    </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  bestScoreCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  bestScoreLabel: {
    fontSize: 16,
    color: '#92400E',
    marginBottom: 8,
    fontWeight: '600',
  },
  bestScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#92400E',
  },
  rulesCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 16,
    color: '#1E40AF',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  timerBox: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  timerLabel: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#92400E',
  },
  timerWarning: {
    color: '#DC2626',
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6EE7B7',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#065F46',
  },
  signCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signImage: {
    width: 250,
    height: 250,
  },
  signDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  validateButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  validateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feedbackBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  feedbackWrong: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  finalScoreLabel: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  finalScoreSubtext: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: '600',
  },
});
