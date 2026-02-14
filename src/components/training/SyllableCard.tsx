import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SyllableCardProps {
  syllable: {
    text: string;
    consonne: string | null;
    voyelle: string | null;
    hand_sign_key: string | null;
    hand_position_config: number | null;
    description: string;
  };
  status: 'pending' | 'current' | 'validated';
  handSignImage?: string;
  handPositionImage?: string;
  handPositionDescription?: string;
  showImageHelp?: boolean;
}

export default function SyllableCard({ 
  syllable, 
  status, 
  handSignImage, 
  handPositionImage,
  handPositionDescription,
  showImageHelp = true
}: SyllableCardProps) {
  const { colors, theme } = useTheme();
  const getStatusStyle = () => {
    switch (status) {
      case 'validated':
        return theme === 'dark' 
          ? { 
              ...styles.cardValidated, 
              backgroundColor: '#065f46', // Vert plus clair et plus visible
              borderColor: '#10B981',
              borderWidth: 3,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 8,
            }
          : styles.cardValidated; // Style original en mode jour
      case 'current':
        return styles.cardCurrent;
      default:
        return styles.cardPending;
    }
  };

  const getStatusBadge = () => {
    if (status === 'validated') {
      return (
        <View style={styles.validatedBadge}>
          <Text style={styles.validatedText}>✅</Text>
        </View>
      );
    }
    if (status === 'current') {
      return (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>▶</Text>
        </View>
      );
    }
    return null;
  };

  const cardBackgroundColor = status === 'validated' 
    ? (theme === 'dark' ? '#065f46' : '#D1FAE5')
    : colors.card;

  const cardBorderColor = status === 'validated'
    ? '#10B981'
    : (status === 'current' ? '#3B82F6' : colors.border);

  return (
    <View style={[styles.card, getStatusStyle(), { backgroundColor: cardBackgroundColor, borderColor: cardBorderColor }]}>
      {getStatusBadge()}
      
      <View style={styles.header}>
        <Text style={[styles.syllableText, { color: colors.text }]}>{syllable.text}</Text>
      </View>

      {showImageHelp && (
        <>
          <View style={styles.imagesContainer}>
            {syllable.consonne && handSignImage && (
              <View style={[styles.imageBox, { backgroundColor: colors.background }]}>
                <Image 
                  source={{ uri: handSignImage }} 
                  style={styles.image}
                  resizeMode="contain"
                />
                <Text style={[styles.imageLabel, { color: colors.textSecondary }]}>
                  Consonne: {syllable.consonne}
                </Text>
              </View>
            )}

            {syllable.voyelle && handPositionImage && (
              <View style={[styles.imageBox, { backgroundColor: colors.background }]}>
                <Image 
                  source={{ uri: handPositionImage }} 
                  style={styles.image}
                  resizeMode="contain"
                />
                <Text style={[styles.imageLabel, { color: colors.textSecondary }]}>
                  Voyelle: {syllable.voyelle}
                </Text>
              </View>
            )}
          </View>

          {syllable.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{syllable.description}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    position: 'relative',
  },
  cardPending: {
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  cardCurrent: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardValidated: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  validatedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validatedText: {
    fontSize: 18,
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  header: {
    marginBottom: 12,
  },
  syllableText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  imageBox: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    maxWidth: 120,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  imageLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
