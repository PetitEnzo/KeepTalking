import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';

interface Syllable {
  text: string;
  consonne: string | null;
  hand_sign_key: string | null;
  hand_position_config: number | null;
  description: string;
}

interface HandConfig {
  key: string;
  name: string;
  image_url: string;
}

interface FacePosition {
  configuration_number: number;
  description: string;
  image_url: string;
  voyelles: string;
}

const HAND_CONFIG_KEYS = ['M', 'J', 'B', 'L', 'K', 'S', 'G', 'ING'];

// Consonnes par configuration de main (basé sur la base de données)
const CONSONNES_BY_CONFIG: { [key: string]: string[] } = {
  'M': ['M', 'T', 'F'],
  'J': ['P', 'J', 'D'],
  'B': ['B', 'N', 'UI'],
  'L': ['L', 'CH', 'GN', 'OU'],
  'K': ['K', 'V', 'Z'],
  'S': ['S', 'R'],
  'G': ['G'],
  'ING': ['ING', 'LLE'],
};

export default function ContributeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [word, setWord] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [syllables, setSyllables] = useState<Syllable[]>([]);
  const [currentSyllable, setCurrentSyllable] = useState<Syllable>({
    text: '',
    consonne: null,
    hand_sign_key: null,
    hand_position_config: null,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [handConfigs, setHandConfigs] = useState<HandConfig[]>([]);
  const [facePositions, setFacePositions] = useState<FacePosition[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadImages();
    }
  }, [user]);

  const loadImages = async () => {
    try {
      // Charger les configurations de main depuis hand_signs
      const { data: handSignsData, error: handSignsError } = await supabase
        .from('hand_signs')
        .select('key, image_url')
        .eq('type', 'consonne')
        .in('key', HAND_CONFIG_KEYS);

      if (!handSignsError && handSignsData) {
        const configs: HandConfig[] = handSignsData.map((sign: any) => ({
          key: sign.key,
          name: sign.key,
          image_url: sign.image_url,
        }));
        setHandConfigs(configs);
      }

      // Charger les positions du visage depuis hand_positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('hand_positions')
        .select('configuration_number, description, image_url, voyelles')
        .order('configuration_number', { ascending: true });

      if (!positionsError && positionsData) {
        setFacePositions(positionsData);
      }

      setImagesLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      setImagesLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userData) {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userData.user_id)
        .single();

      setUserStats(stats);
    }
  };

  const addSyllable = () => {
    if (!currentSyllable.text.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le texte de la syllabe');
      return;
    }

    if (!currentSyllable.hand_sign_key) {
      Alert.alert('Erreur', 'Veuillez sélectionner une configuration de main');
      return;
    }

    if (!currentSyllable.consonne) {
      Alert.alert('Erreur', 'Veuillez sélectionner une consonne');
      return;
    }

    if (!currentSyllable.hand_position_config) {
      Alert.alert('Erreur', 'Veuillez sélectionner une position du visage');
      return;
    }

    // Générer la description automatiquement
    const position = facePositions.find(p => p.configuration_number === currentSyllable.hand_position_config);
    const positionDescription = position?.description || 'Position inconnue';
    const configName = currentSyllable.hand_sign_key;
    const description = `${positionDescription} - Configuration ${configName}`;

    const syllableWithDescription = {
      ...currentSyllable,
      description,
    };

    setSyllables([...syllables, syllableWithDescription]);
    setCurrentSyllable({
      text: '',
      consonne: null,
      hand_sign_key: null,
      hand_position_config: null,
      description: '',
    });
  };

  const removeSyllable = (index: number) => {
    setSyllables(syllables.filter((_, i) => i !== index));
  };

  const submitWord = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour contribuer');
      return;
    }

    if (!word.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un mot');
      return;
    }

    if (syllables.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une syllabe');
      return;
    }

    // Vérifier que toutes les syllabes sont complètes
    const incompleteSyllable = syllables.find(
      s => !s.text || !s.hand_sign_key || !s.consonne || !s.hand_position_config
    );
    
    if (incompleteSyllable) {
      Alert.alert(
        'Erreur',
        `La syllabe "${incompleteSyllable.text || 'vide'}" est incomplète. Toutes les syllabes doivent avoir :\n- Un texte\n- Une configuration de main\n- Une consonne\n- Une position du visage`
      );
      return;
    }

    setLoading(true);

    try {
      // Get user_id
      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        throw new Error('Utilisateur non trouvé');
      }

      // Insert word contribution
      const { error: insertError } = await supabase
        .from('word_contributions')
        .insert({
          user_id: userData.user_id,
          word: word.trim(),
          difficulty,
          syllables: syllables,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Update user_stats
      const today = new Date().toISOString().split('T')[0];
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('words_contributed_today, last_word_contribution_date, total_words_contributed')
        .eq('user_id', userData.user_id)
        .single();

      let newContributionsToday = 1;
      if (
        currentStats &&
        currentStats.last_word_contribution_date === today
      ) {
        newContributionsToday = (currentStats.words_contributed_today || 0) + 1;
      }

      await supabase
        .from('user_stats')
        .update({
          words_contributed_today: newContributionsToday,
          last_word_contribution_date: today,
          total_words_contributed: (currentStats?.total_words_contributed || 0) + 1,
        })
        .eq('user_id', userData.user_id);

      // Réinitialiser le formulaire
      setWord('');
      setSyllables([]);
      setCurrentSyllable({
        text: '',
        consonne: null,
        hand_sign_key: null,
        hand_position_config: null,
        description: '',
      });

      // Afficher la pop-up de remerciement
      Alert.alert(
        '🎉 Merci pour votre contribution !',
        `Votre mot "${word}" a été soumis avec succès !\n\n` +
        `⏳ En attente de validation par un modérateur\n` +
        `✨ Vous gagnerez +50 XP une fois votre mot validé`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error submitting word:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter le mot');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthIcon}>🔒</Text>
          <Text style={styles.notAuthTitle}>Connexion requise</Text>
          <Text style={styles.notAuthText}>
            Vous devez être connecté pour contribuer des mots
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>✍️ Ajouter un mot</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Contribuez à la communauté en ajoutant de nouveaux mots LFPC
          </Text>
        </View>

        {/* XP Info */}
        {userStats && (
          <View style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={[styles.xpText, { color: colors.text }]}>
              Chaque mot validé vous rapporte <Text style={[styles.xpAmount, { color: colors.success }]}>50 XP</Text>
            </Text>
          </View>
        )}

        {/* Word Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mot à ajouter</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={word}
            onChangeText={setWord}
            placeholder="Entrez le mot (ex: Chocolat)"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulté</Text>
          <View style={styles.difficultyButtons}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  difficulty === level && styles.difficultyButtonActive,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    { color: colors.textSecondary },
                    difficulty === level && styles.difficultyButtonTextActive,
                  ]}
                >
                  {level === 'beginner' && '🌱 Débutant'}
                  {level === 'intermediate' && '📚 Intermédiaire'}
                  {level === 'advanced' && '🏆 Avancé'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Current Syllable Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajouter une syllabe</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={currentSyllable.text}
            onChangeText={(text) =>
              setCurrentSyllable({ ...currentSyllable, text })
            }
            placeholder="Texte de la syllabe (ex: Bon)"
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>Configuration de main</Text>
          {imagesLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des images...</Text>
          ) : (
            <View style={styles.configButtons}>
              {handConfigs.map((config) => (
                <Pressable
                  key={config.key}
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    currentSyllable.hand_sign_key === config.key && styles.configButtonActive,
                  ]}
                  onPress={() =>
                    setCurrentSyllable({
                      ...currentSyllable,
                      hand_sign_key: config.key,
                    })
                  }
                >
                  <Image
                    source={{ uri: config.image_url }}
                    style={styles.configImage}
                    resizeMode="contain"
                  />
                </Pressable>
              ))}
            </View>
          )}
          
          {/* Sélecteur de consonne basé sur la configuration */}
          {currentSyllable.hand_sign_key && (
            <View style={styles.consonneSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Consonne</Text>
              <View style={styles.consonneButtons}>
                {CONSONNES_BY_CONFIG[currentSyllable.hand_sign_key]?.map((consonne) => (
                  <Pressable
                    key={consonne}
                    style={[
                      styles.consonneButton,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      currentSyllable.consonne === consonne && styles.consonneButtonActive,
                    ]}
                    onPress={() =>
                      setCurrentSyllable({
                        ...currentSyllable,
                        consonne: consonne,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.consonneButtonText,
                        { color: colors.textSecondary },
                        currentSyllable.consonne === consonne && styles.consonneButtonTextActive,
                      ]}
                    >
                      {consonne}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          
          <Text style={[styles.inputLabel, { color: colors.text }]}>Position du visage</Text>
          {imagesLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des images...</Text>
          ) : (
            <View style={styles.positionButtons}>
              {facePositions.map((position) => (
                <Pressable
                  key={position.configuration_number}
                  style={[
                    styles.positionButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    currentSyllable.hand_position_config === position.configuration_number &&
                      styles.positionButtonActive,
                  ]}
                  onPress={() =>
                    setCurrentSyllable({
                      ...currentSyllable,
                      hand_position_config: position.configuration_number,
                    })
                  }
                >
                  <Image
                    source={{ uri: position.image_url }}
                    style={styles.positionImage}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.positionButtonText,
                      { color: colors.textSecondary },
                      currentSyllable.hand_position_config === position.configuration_number &&
                        styles.positionButtonTextActive,
                    ]}
                  >
                    {position.description}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={[
                  styles.positionButton,
                  !currentSyllable.hand_position_config && styles.positionButtonActive,
                ]}
                onPress={() =>
                  setCurrentSyllable({ ...currentSyllable, hand_position_config: null })
                }
              >
                <Text style={styles.positionEmoji}>❌</Text>
                <Text
                  style={[
                    styles.positionButtonText,
                    !currentSyllable.hand_position_config &&
                      styles.positionButtonTextActive,
                  ]}
                >
                  Aucune
                </Text>
              </Pressable>
            </View>
          )}
          
          <Pressable style={styles.addButton} onPress={addSyllable}>
            <Text style={styles.addButtonText}>➕ Ajouter la syllabe</Text>
          </Pressable>
        </View>

        {/* Syllables List */}
        {syllables.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Syllabes ajoutées ({syllables.length})
            </Text>
            {syllables.map((syllable, index) => (
              <View key={index} style={[styles.syllableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.syllableInfo}>
                  <Text style={[styles.syllableText, { color: colors.text }]}>{syllable.text}</Text>
                  {syllable.consonne && (
                    <Text style={[styles.syllableDetail, { color: colors.textSecondary }]}>
                      Consonne: {syllable.consonne}
                    </Text>
                  )}
                  {syllable.hand_sign_key && (
                    <Text style={[styles.syllableDetail, { color: colors.textSecondary }]}>
                      Config: {syllable.hand_sign_key}
                    </Text>
                  )}
                  {syllable.hand_position_config && (
                    <Text style={[styles.syllableDetail, { color: colors.textSecondary }]}>
                      Position: {syllable.hand_position_config}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeSyllable(index)}
                >
                  <Text style={styles.removeButtonText}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          style={styles.submitButton}
          onPress={submitWord}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '⏳ Envoi en cours...' : '🚀 Soumettre le mot'}
          </Text>
        </Pressable>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Comment ça marche ?</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Ajoutez un mot et décomposez-le en syllabes{' \n'}
            • Indiquez la configuration de main et la position du visage{' \n'}
            • Votre contribution sera vérifiée par un modérateur{' \n'}
            • Une fois approuvée, elle sera disponible pour tous !
          </Text>
        </View>
      </View>
    </ScrollView>
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
  limitCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  limitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  limitInfo: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  limitText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  xpCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  xpIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  xpText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  xpAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B45309',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 12,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  syllableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  syllableInfo: {
    flex: 1,
  },
  syllableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  syllableDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  notAuthText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  imagePreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 8,
  },
  configButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  configButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    minWidth: 60,
    alignItems: 'center',
  },
  configButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  configButtonTextActive: {
    color: '#FFFFFF',
  },
  configEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  configImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  consonneSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  consonneButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  consonneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    minWidth: 60,
    alignItems: 'center',
  },
  consonneButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  consonneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  consonneButtonTextActive: {
    color: '#FFFFFF',
  },
  positionButtons: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  positionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  positionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  positionImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  positionButtonTextActive: {
    color: '#FFFFFF',
  },
});
