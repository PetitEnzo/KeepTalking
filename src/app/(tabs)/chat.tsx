import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  translation?: {
    word: string;
    syllables: Array<{
      syllable: string;
      config?: string;
      position?: string;
      configDescription?: string;
      positionDescription?: string;
      configImageUrl?: string;
      positionImageUrl?: string;
    }>;
  };
}

interface HandPosition {
  configuration_number: number;
  description: string;
  voyelles: string;
  image_url: string;
}

interface HandSign {
  key: string;
  label: string;
  image_url: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant LFPC. Envoyez-moi un mot et je vous montrerai comment le coder en LFPC ! 👋',
      isUser: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [positions, setPositions] = useState<HandPosition[]>([]);
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadPositions();
    loadHandSigns();
  }, []);

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('hand_positions')
        .select('*')
        .order('configuration_number', { ascending: true });

      if (!error && data) {
        setPositions(data);
      }
    } catch (error) {
      console.error('Erreur chargement positions:', error);
    }
  };

  const loadHandSigns = async () => {
    try {
      const { data, error } = await supabase
        .from('hand_signs')
        .select('*')
        .eq('type', 'consonne');

      if (!error && data) {
        setHandSigns(data);
      }
    } catch (error) {
      console.error('Erreur chargement hand_signs:', error);
    }
  };

  const getConfigForConsonant = (consonant: string): { config: string; description: string; imageUrl?: string } | null => {
    const configMap: { [key: string]: { config: string; description: string } } = {
      'M': { config: 'M', description: 'Config M (M, T, F)' },
      'T': { config: 'M', description: 'Config M (M, T, F)' },
      'F': { config: 'M', description: 'Config M (M, T, F)' },
      'P': { config: 'J', description: 'Config J (P, D, J)' },
      'D': { config: 'J', description: 'Config J (P, D, J)' },
      'J': { config: 'J', description: 'Config J (P, D, J)' },
      'B': { config: 'B', description: 'Config B (B, N, UI)' },
      'N': { config: 'B', description: 'Config B (B, N, UI)' },
      'L': { config: 'L', description: 'Config L (L, CH, OU, GN)' },
      'CH': { config: 'L', description: 'Config L (L, CH, OU, GN)' },
      'GN': { config: 'L', description: 'Config L (L, CH, OU, GN)' },
      'K': { config: 'K', description: 'Config K (K, Z, V)' },
      'C': { config: 'K', description: 'Config K (K, Z, V)' },
      'Q': { config: 'K', description: 'Config K (K, Z, V)' },
      'Z': { config: 'K', description: 'Config K (K, Z, V)' },
      'V': { config: 'K', description: 'Config K (K, Z, V)' },
      'S': { config: 'R', description: 'Config R (S, R)' },
      'R': { config: 'R', description: 'Config R (S, R)' },
      'G': { config: 'G', description: 'Config G' },
    };
    
    const upper = consonant.toUpperCase();
    const configInfo = configMap[upper];
    if (!configInfo) return null;

    // Trouver l'image correspondante
    const sign = handSigns.find(s => s.key === configInfo.config);
    return {
      ...configInfo,
      imageUrl: sign?.image_url
    };
  };

  const getPositionForVowel = (vowel: string): { position: number; description: string; imageUrl?: string } | null => {
    const vowelMap: { [key: string]: number } = {
      'IN': 1, 'EU': 1, 'UN': 1, 'AIN': 1, 'EIN': 1,
      'A': 2, 'O': 2, 'E': 2, 'AI': 2, 'OE': 2,
      'I': 3, 'ON': 3, 'AN': 3, 'EN': 3,
      'È': 4, 'Ê': 4, 'OU': 4, 'OI': 4, 'AU': 4,
      'U': 5, 'É': 5, 'Ù': 5, 'EI': 5,
    };

    const upper = vowel.toUpperCase();
    const posNum = vowelMap[upper];
    
    if (posNum && positions.length > 0) {
      const pos = positions.find(p => p.configuration_number === posNum);
      if (pos) {
        return { 
          position: posNum, 
          description: pos.description,
          imageUrl: pos.image_url
        };
      }
    }
    
    return null;
  };

  const translateWord = (word: string) => {
    // Retirer les apostrophes et nettoyer
    const cleanWord = word.trim().toUpperCase().replace(/[']/g, '');
    
    // Décomposition simple en syllabes (règles basiques)
    const syllables: Array<{
      syllable: string;
      config?: string;
      position?: string;
      configDescription?: string;
      positionDescription?: string;
    }> = [];

    // Règles de décomposition simplifiées
    let i = 0;
    while (i < cleanWord.length) {
      let syllable = '';
      let config = '';
      let position = '';
      let configDesc = '';
      let posDesc = '';

      // Ignorer les espaces et caractères spéciaux
      while (i < cleanWord.length && !' AEIOUYÉÈÊÀÙÛ'.includes(cleanWord[i]) && cleanWord[i] !== "'") {
        syllable += cleanWord[i];
        i++;
      }

      // Si on a une consonne, chercher sa config
      let configImageUrl = '';
      if (syllable.length > 0) {
        const configInfo = getConfigForConsonant(syllable);
        if (configInfo) {
          config = configInfo.config;
          configDesc = configInfo.description;
          configImageUrl = configInfo.imageUrl || '';
        }
      }

      // Voyelle(s) - gérer les diphtongues AI, OI, OU, etc.
      let vowelPart = '';
      const startVowelIndex = i;
      while (i < cleanWord.length && 'AEIOUYÉÈÊÀÙÛ'.includes(cleanWord[i])) {
        vowelPart += cleanWord[i];
        i++;
        
        // Limiter à 2 voyelles pour les diphtongues
        if (vowelPart.length >= 2) {
          // Vérifier si c'est une diphtongue connue
          const diphtongues = ['AI', 'OI', 'OU', 'AU', 'EU', 'EI', 'OE'];
          if (!diphtongues.includes(vowelPart)) {
            // Pas une diphtongue, revenir en arrière
            i = startVowelIndex + 1;
            vowelPart = cleanWord[startVowelIndex];
          }
          break;
        }
      }

      let positionImageUrl = '';
      if (vowelPart.length > 0) {
        syllable += vowelPart;
        const posInfo = getPositionForVowel(vowelPart);
        if (posInfo) {
          position = posInfo.position.toString();
          posDesc = posInfo.description;
          positionImageUrl = posInfo.imageUrl || '';
        }
      }

      if (syllable.length > 0) {
        syllables.push({
          syllable,
          config: config || undefined,
          position: position || undefined,
          configDescription: configDesc || undefined,
          positionDescription: posDesc || undefined,
          configImageUrl: configImageUrl || undefined,
          positionImageUrl: positionImageUrl || undefined,
        });
      }
    }

    return {
      word: cleanWord,
      syllables,
    };
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Vérifier qu'il n'y a qu'un seul mot (pas d'espaces)
    if (inputText.trim().includes(' ')) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '⚠️ Veuillez entrer un seul mot à la fois (sans espaces).',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    const translation = translateWord(inputText);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `Voici comment coder "${translation.word}" en LFPC :`,
      isUser: false,
      translation,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
    
    // Incrémenter la streak si c'est la première utilisation du chatbot aujourd'hui
    updateStreak();
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

      if (lastActivity === today) {
        // Déjà utilisé aujourd'hui, ne rien faire
        return;
      } else if (lastActivity === yesterdayStr) {
        // Utilisé hier, incrémenter la streak
        newStreak += 1;
      } else {
        // Pas utilisé hier, réinitialiser la streak à 1
        newStreak = 1;
      }

      await supabase
        .from('users_profiles')
        .update({
          last_activity_date: today,
          current_streak: newStreak,
        })
        .eq('id', user.id);

      console.log('✅ Streak mise à jour:', newStreak);
    } catch (error) {
      console.error('Erreur mise à jour streak:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Assistant LFPC</Text>
        <Text style={styles.headerSubtitle}>Traduisez vos mots en LFPC</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            <View style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.botText
              ]}>
                {message.text}
              </Text>

              {message.translation && (
                <View style={styles.translationContainer}>
                  {message.translation.syllables.map((syl, index) => (
                    <View key={index} style={styles.syllableCard}>
                      <Text style={styles.syllableText}>{syl.syllable}</Text>
                      
                      <View style={styles.imagesRow}>
                        {syl.configImageUrl && (
                          <View style={styles.imageContainer}>
                            <Image 
                              source={{ uri: syl.configImageUrl }} 
                              style={styles.handImage}
                              resizeMode="contain"
                            />
                            <Text style={styles.imageLabel}>Configuration</Text>
                          </View>
                        )}
                        {syl.positionImageUrl && (
                          <View style={styles.imageContainer}>
                            <Image 
                              source={{ uri: syl.positionImageUrl }} 
                              style={styles.handImage}
                              resizeMode="contain"
                            />
                            <Text style={styles.imageLabel}>Position</Text>
                          </View>
                        )}
                      </View>

                      {syl.config && (
                        <Text style={styles.configText}>🤚 {syl.configDescription}</Text>
                      )}
                      {syl.position && (
                        <Text style={styles.positionText}>📍 Position {syl.position}: {syl.positionDescription}</Text>
                      )}
                      {!syl.config && !syl.position && (
                        <Text style={styles.noTranslation}>Consonne finale</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez un mot à traduire..."
          placeholderTextColor="#94A3B8"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1E293B',
  },
  translationContainer: {
    marginTop: 12,
    gap: 8,
  },
  syllableCard: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  syllableText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  configText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  positionText: {
    fontSize: 14,
    color: '#475569',
  },
  noTranslation: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
  },
  handImage: {
    width: 100,
    height: 100,
  },
  imageLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
