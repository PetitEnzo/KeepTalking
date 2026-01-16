import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabase';

interface LessonSection {
  type: 'text' | 'quiz' | 'info' | 'practice' | 'image';
  title?: string;
  content?: string;
  question?: string;
  options?: string[];
  optionImages?: string[]; // imageKeys pour les options de quiz
  optionImageUrls?: string[]; // URLs chargées pour les images des options
  correctAnswer?: number;
  explanation?: string;
  imageKey?: string;
  imageUrl?: string;
}

const lessonContent: { [key: string]: { title: string; sections: LessonSection[] } } = {
  '1': {
    title: 'Introduction au LFPC',
    sections: [
      {
        type: 'text',
        title: 'Bienvenue dans votre première leçon !',
        content: 'Le Langage Français Parlé Complété (LFPC) est un outil de communication visuelle qui complète la lecture labiale. Il permet aux personnes sourdes ou malentendantes de percevoir visuellement tous les sons de la langue française.',
      },
      {
        type: 'info',
        title: 'Pourquoi le LFPC ?',
        content: 'La lecture labiale seule ne permet de distinguer que 30% des sons. Le LFPC complète cette lecture en ajoutant des gestes manuels, permettant ainsi de percevoir 100% des sons de la parole.',
      },
      {
        type: 'text',
        title: 'Les deux composantes du LFPC',
        content: 'Le LFPC utilise deux éléments essentiels :\n\n1. **8 configurations de main** : Des formes différentes de la main qui représentent des groupes de consonnes.\n\n2. **5 positions autour du visage** : Des emplacements précis où placer la main pour représenter les voyelles.',
      },
      {
        type: 'quiz',
        question: 'Combien de configurations de main existe-t-il en LFPC ?',
        options: ['5 configurations', '8 configurations', '10 configurations', '12 configurations'],
        correctAnswer: 1,
        explanation: 'Il existe exactement 8 configurations de main en LFPC, chacune représentant un groupe de consonnes.',
      },
      {
        type: 'text',
        title: 'Comment ça fonctionne ?',
        content: 'Chaque syllabe est codée par une **configuration de main** (pour la consonne) et une **position** (pour la voyelle).\n\nPar exemple, pour dire "papa" :\n- "pa" = configuration P + position A\n- "pa" = configuration P + position A',
      },
      {
        type: 'info',
        title: 'Le saviez-vous ?',
        content: 'Le LFPC a été inventé en 1967 par le Dr. R. Orin Cornett aux États-Unis, puis adapté au français en 1977. Aujourd\'hui, il est utilisé dans plus de 60 pays !',
      },
      {
        type: 'quiz',
        question: 'Que représentent les 5 positions autour du visage ?',
        options: ['Les consonnes', 'Les voyelles', 'Les syllabes', 'Les mots'],
        correctAnswer: 1,
        explanation: 'Les 5 positions autour du visage représentent les voyelles, tandis que les 8 configurations de main représentent les consonnes.',
      },
      {
        type: 'text',
        title: 'Les avantages du LFPC',
        content: '✓ Accès complet à la langue française\n✓ Amélioration de la lecture et de l\'écriture\n✓ Développement du langage oral\n✓ Facilite l\'apprentissage des langues étrangères\n✓ Renforce les liens familiaux',
      },
      {
        type: 'practice',
        title: 'Prêt pour la suite ?',
        content: 'Dans la prochaine leçon, vous découvrirez en détail les 8 configurations de main et comment les former correctement.\n\nFélicitations pour avoir terminé cette introduction ! 🎉',
      },
    ],
  },
  '2': {
    title: 'Les 8 configurations de main',
    sections: [
      {
        type: 'text',
        title: 'Les 8 configurations essentielles',
        content: 'En LFPC, il existe 8 configurations de main différentes. Chaque configuration représente un groupe de consonnes qui se ressemblent visuellement sur les lèvres.\n\nCes configurations permettent de distinguer clairement toutes les consonnes de la langue française.',
      },
      {
        type: 'info',
        title: 'Pourquoi 8 configurations ?',
        content: 'Le nombre 8 a été choisi car il permet de couvrir toutes les consonnes françaises de manière optimale, en regroupant celles qui sont visuellement similaires sur les lèvres.',
      },
      {
        type: 'image',
        title: 'Configuration 1 : Main ouverte',
        imageKey: 'M',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : M, T, F\n\nMain ouverte, tous les doigts tendus.\n\nUtilisé pour : "Maman", "Tarte", "Feu"',
      },
      {
        type: 'image',
        title: 'Configuration 2 : Index tendu',
        imageKey: 'J',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : J, D, P\n\nMain fermé, index tendu.\n\nUtilisé pour : "Joue", "Dodo", "Papa"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration utilise-t-on pour les consonnes J, D, P ?',
        options: ['Configuration 1', 'Configuration 2', 'Configuration 5', 'Configuration 3'],
        optionImages: ['M', 'J', 'K', 'B'],
        correctAnswer: 1,
        explanation: 'La configuration 2 (main fermé, index tendu) est utilisée pour les consonnes J, D et P.',
      },
      {
        type: 'image',
        title: 'Configuration 3 : Quatre doigts',
        imageKey: 'B',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : B, N, UI\n\nQuatre doigts, pouce rentré.\n\nUtilisé pour : "Bébé", "Nez", "Nuit"',
      },
      {
        type: 'image',
        title: 'Configuration 4 : Pouce et index',
        imageKey: 'L',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : CH, OU, L, GN\n\nMain fermé, pouce et index tendu.\n\nUtilisé pour : "Chat", "Oui", "Lune", "Montagne"',
      },
      {
        type: 'image',
        title: 'Configuration 5 : Index et majeur',
        imageKey: 'K',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : K, Z, V\n\nMain fermé, index et majeur tendu.\n\nUtilisé pour : "Kiwi", "Zéro", "Vélo"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration correspond aux consonnes CH, OU, L, GN ?',
        options: ['Configuration 3', 'Configuration 4', 'Configuration 6', 'Configuration 7'],
        optionImages: ['B', 'L', 'S', 'G'],
        correctAnswer: 1,
        explanation: 'La configuration 4 (main fermé, pouce et index tendu) est utilisée pour les consonnes CH, OU, L, GN.',
      },
      {
        type: 'image',
        title: 'Configuration 6 : Trois doigts spéciaux',
        imageKey: 'S',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : S, R\n\nAuriculaire annulaire et majeur, index demi fermé.\n\nUtilisé pour : "Soleil", "Rue"',
      },
      {
        type: 'image',
        title: 'Configuration 7 : Trois doigts tendus',
        imageKey: 'G',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : G\n\nMain fermé, pouce index et majeur tendu.\n\nUtilisé pour : "Gare"',
      },
      {
        type: 'image',
        title: 'Configuration 8 : Index et majeur écartés',
        imageKey: 'ING',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : ING, LLE\n\nMain fermé, index et majeur tendu et ecarté.\n\nUtilisé pour : "Parking", "Fille"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration correspond aux consonnes S, R ?',
        options: ['Configuration 5', 'Configuration 6', 'Configuration 7', 'Configuration 8'],
        optionImages: ['K', 'S', 'G', 'ING'],
        correctAnswer: 1,
        explanation: 'La configuration 6 (auriculaire annulaire et majeur, index demi fermé) est utilisée pour les consonnes S et R.',
      },
      {
        type: 'info',
        title: 'Astuce pour mémoriser',
        content: 'Pour retenir les configurations, pratiquez-les dans l\'ordre (1 à 8) en répétant les consonnes associées. Avec de la pratique, vos mains formeront automatiquement la bonne configuration !',
      },
      {
        type: 'practice',
        title: 'Entraînez-vous !',
        content: 'Maintenant que vous connaissez les 8 configurations, entraînez-vous à les former avec votre main.\n\nDans la prochaine leçon, vous apprendrez les 5 positions autour du visage pour coder les voyelles.\n\nBravo pour avoir terminé cette leçon ! 🎉',
      },
    ],
  },
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [lessonWithImages, setLessonWithImages] = useState<{ title: string; sections: LessonSection[] } | null>(null);

  const lesson = lessonContent[id as string];

  useEffect(() => {
    loadHandSignImages();
  }, [id]);

  const loadHandSignImages = async () => {
    if (!lesson) return;

    console.log('🖼️ Chargement des images depuis hand_signs...');
    console.log('Leçon ID:', id);

    try {
      // Charger toutes les images depuis hand_signs
      const { data: handSigns, error } = await supabase
        .from('hand_signs')
        .select('*')
        .eq('type', 'consonne');

      console.log('📊 Résultat hand_signs:', { count: handSigns?.length, error });

      if (error) {
        console.error('❌ Erreur chargement images:', error);
        setLessonWithImages(lesson);
        return;
      }

      if (!handSigns || handSigns.length === 0) {
        console.warn('⚠️ Aucune image trouvée dans hand_signs');
        setLessonWithImages(lesson);
        return;
      }

      // Créer un map des images par clé
      const imageMap: { [key: string]: string } = {};
      handSigns?.forEach((sign: any) => {
        console.log(`  - ${sign.key}: ${sign.image_url}`);
        imageMap[sign.key] = sign.image_url;
      });

      console.log('🗺️ Image map créé:', imageMap);

      // Remplacer les URLs dans les sections
      const updatedSections = lesson.sections.map((section, index) => {
        if (section.type === 'image' && section.imageKey && section.imageUrl === 'LOAD_FROM_DB') {
          const newUrl = imageMap[section.imageKey];
          console.log(`  Section ${index}: ${section.imageKey} -> ${newUrl || 'NOT FOUND'}`);
          return {
            ...section,
            imageUrl: newUrl || section.imageUrl
          };
        }
        
        // Charger les images pour les options de quiz
        if (section.type === 'quiz' && section.optionImages) {
          const optionImageUrls = section.optionImages.map(key => imageMap[key] || '');
          console.log(`  Quiz ${index}: options images ->`, optionImageUrls);
          return {
            ...section,
            optionImageUrls: optionImageUrls
          };
        }
        
        return section;
      });

      console.log('✅ Images chargées avec succès');
      setLessonWithImages({
        title: lesson.title,
        sections: updatedSections
      });
    } catch (error) {
      console.error('❌ Exception chargement images:', error);
      setLessonWithImages(lesson);
    }
  };

  const displayLesson = lessonWithImages || lesson;

  if (!displayLesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Chargement...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Leçon non trouvée</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const section = displayLesson.sections[currentSection];
  const isLastSection = currentSection === displayLesson.sections.length - 1;
  const progress = ((currentSection + 1) / displayLesson.sections.length) * 100;

  const handleNext = async () => {
    if (isLastSection) {
      // Calculer le score final et vérifier si la leçon est réussie
      const totalQuestions = displayLesson.sections.filter(s => s.type === 'quiz').length;
      const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 100;
      const isPassed = scorePercentage >= 60; // Minimum 60% pour réussir

      console.log('🎓 Fin de la leçon');
      console.log('Score:', score, '/', totalQuestions, '=', scorePercentage.toFixed(0) + '%');
      console.log('Réussite:', isPassed ? 'OUI ✅' : 'NON ❌');

      // Sauvegarder la progression dans tous les cas (réussite ou échec)
      if (user) {
        console.log('🎓 Sauvegarde de la progression de la leçon...');
        console.log('User ID:', user.id);
        console.log('Lesson ID:', id);
        console.log('Passed:', isPassed);

        try {
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: user.id,
              lesson_id: id as string,
              completed: true,
              passed: isPassed,
              completed_at: new Date().toISOString(),
              score: score,
            }, {
              onConflict: 'user_id,lesson_id'
            })
            .select();

          console.log('📊 Résultat progression:', { data: progressData, error: progressError });

          if (progressError) {
            console.error('❌ Erreur progression:', progressError);
            alert(`Erreur lors de la sauvegarde: ${progressError.message}`);
          } else {
            console.log('✅ Progression sauvegardée avec succès');
          }

          // Mettre à jour le streak seulement si réussi
          if (isPassed) {
            const today = new Date().toISOString().split('T')[0];
            const { data: profileData } = await supabase
              .from('users_profiles')
              .select('last_activity_date, current_streak')
              .eq('id', user.id)
              .single();

            if (profileData) {
              const lastActivity = profileData.last_activity_date;
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              let newStreak = profileData.current_streak || 0;
              
              if (lastActivity === yesterdayStr) {
                newStreak += 1;
              } else if (lastActivity !== today) {
                newStreak = 1;
              }

              const { error: streakError } = await supabase
                .from('users_profiles')
                .update({
                  last_activity_date: today,
                  current_streak: newStreak,
                })
                .eq('id', user.id);

              if (streakError) {
                console.error('❌ Erreur streak:', streakError);
              } else {
                console.log('✅ Streak mis à jour:', newStreak);
              }
            }
          }

        } catch (error) {
          console.error('❌ Exception lors de la sauvegarde:', error);
        }
      }

      router.push('/(tabs)/lessons');
    } else {
      setCurrentSection(currentSection + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === section.correctAnswer && !answeredQuestions.has(currentSection)) {
      setScore(score + 1);
      setAnsweredQuestions(new Set(answeredQuestions).add(currentSection));
    }
  };

  const renderSection = () => {
    switch (section.type) {
      case 'text':
        return (
          <View style={styles.sectionContainer}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        );

      case 'info':
        return (
          <View style={[styles.sectionContainer, styles.infoBox]}>
            <Text style={styles.infoIcon}>💡</Text>
            {section.title && <Text style={styles.infoTitle}>{section.title}</Text>}
            <Text style={styles.infoContent}>{section.content}</Text>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.quizTitle}>Question</Text>
            <Text style={styles.quizQuestion}>{section.question}</Text>
            
            <View style={styles.optionsContainer}>
              {section.options?.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  style={[
                    styles.optionButton,
                    section.optionImageUrls ? styles.optionButtonWithImage : null,
                    selectedAnswer === index && styles.optionButtonSelected,
                    showExplanation && index === section.correctAnswer && styles.optionButtonCorrect,
                    showExplanation && selectedAnswer === index && index !== section.correctAnswer && styles.optionButtonWrong,
                  ]}
                >
                  {section.optionImageUrls && section.optionImageUrls[index] ? (
                    <View style={styles.optionImageContainer}>
                      <Image 
                        source={{ uri: section.optionImageUrls[index] }} 
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                      <Text style={[
                        styles.optionImageLabel,
                        selectedAnswer === index && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === index && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {showExplanation && (
              <View style={[
                styles.explanationBox,
                selectedAnswer === section.correctAnswer ? styles.explanationCorrect : styles.explanationWrong
              ]}>
                <Text style={styles.explanationTitle}>
                  {selectedAnswer === section.correctAnswer ? '✓ Correct !' : '✗ Incorrect'}
                </Text>
                <Text style={styles.explanationText}>{section.explanation}</Text>
              </View>
            )}
          </View>
        );

      case 'practice':
        const totalQuestions = displayLesson.sections.filter(s => s.type === 'quiz').length;
        const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 100;
        const isPassed = scorePercentage >= 60;
        
        return (
          <View style={[styles.sectionContainer, styles.practiceBox]}>
            <Text style={styles.practiceIcon}>{isPassed ? '🎯' : '💪'}</Text>
            {section.title && <Text style={styles.practiceTitle}>{section.title}</Text>}
            
            {isPassed ? (
              <>
                <Text style={styles.practiceContent}>{section.content}</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>✅ Score : {score}/{totalQuestions} ({scorePercentage.toFixed(0)}%)</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.practiceContent}>
                  Vous avez obtenu {score}/{totalQuestions} ({scorePercentage.toFixed(0)}%).{'\n\n'}
                  Ne vous découragez pas ! L'apprentissage du LFPC demande de la pratique. Prenez le temps de revoir les configurations et réessayez.{'\n\n'}
                  💡 Astuce : Concentrez-vous sur les différences entre chaque configuration de main.
                </Text>
                <View style={[styles.scoreBox, styles.scoreBoxFailed]}>
                  <Text style={styles.scoreTextFailed}>❌ Score insuffisant (minimum 60% requis)</Text>
                </View>
              </>
            )}
          </View>
        );

      case 'image':
        return (
          <View style={styles.sectionContainer}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            {section.imageUrl && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: section.imageUrl }} 
                  style={styles.handImage}
                  resizeMode="contain"
                />
              </View>
            )}
            {section.content && <Text style={styles.sectionContent}>{section.content}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.lessonTitle}>{displayLesson.title}</Text>
        <Text style={styles.progressText}>{currentSection + 1}/{displayLesson.sections.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderSection()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          onPress={handlePrevious}
          disabled={currentSection === 0}
          style={[styles.navButton, styles.navButtonSecondary, currentSection === 0 && styles.navButtonDisabled]}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Précédent</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={section.type === 'quiz' && !showExplanation}
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            section.type === 'quiz' && !showExplanation && styles.navButtonDisabled
          ]}
        >
          <Text style={styles.navButtonText}>
            {isLastSection ? 'Terminer' : 'Suivant →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748B',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    width: 40,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 28,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  infoContent: {
    fontSize: 16,
    color: '#1E40AF',
    lineHeight: 24,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quizQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionButtonWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionButtonWithImage: {
    padding: 8,
  },
  optionImageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  optionImage: {
    width: 120,
    height: 120,
  },
  optionImageLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
  },
  optionTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  explanationCorrect: {
    backgroundColor: '#D1FAE5',
  },
  explanationWrong: {
    backgroundColor: '#FEE2E2',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  practiceBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  practiceIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
    textAlign: 'center',
  },
  practiceContent: {
    fontSize: 16,
    color: '#15803D',
    lineHeight: 24,
    textAlign: 'center',
  },
  scoreBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
  },
  scoreBoxFailed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  scoreTextFailed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  handImage: {
    width: 300,
    height: 300,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  navButtonSecondary: {
    backgroundColor: '#F1F5F9',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navButtonTextSecondary: {
    color: '#64748B',
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});
