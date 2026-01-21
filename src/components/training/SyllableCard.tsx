import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

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
}

export default function SyllableCard({ 
  syllable, 
  status, 
  handSignImage, 
  handPositionImage,
  handPositionDescription
}: SyllableCardProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'validated':
        return styles.cardValidated;
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

  return (
    <View style={[styles.card, getStatusStyle()]}>
      {getStatusBadge()}
      
      <View style={styles.header}>
        <Text style={styles.syllableText}>{syllable.text}</Text>
      </View>

      <View style={styles.imagesContainer}>
        {syllable.consonne && handSignImage && (
          <View style={styles.imageBox}>
            <Image 
              source={{ uri: handSignImage }} 
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.imageLabel}>
              Consonne: {syllable.consonne}
            </Text>
          </View>
        )}

        {syllable.voyelle && handPositionImage && (
          <View style={styles.imageBox}>
            <Image 
              source={{ uri: handPositionImage }} 
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.imageLabel}>
              Voyelle: {syllable.voyelle}
            </Text>
          </View>
        )}
      </View>

      {handPositionDescription && (
        <Text style={styles.description}>
          Position: {handPositionDescription}
        </Text>
      )}
      {!handPositionDescription && syllable.description && (
        <Text style={styles.description}>{syllable.description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
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
    backgroundColor: '#F9FAFB',
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
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
});
