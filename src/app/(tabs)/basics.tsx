import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Configuration {
  number: number;
  label: string;
  consonnes: string[];
  image_url: string;
}

const CONFIGURATIONS: Configuration[] = [
  {
    number: 1,
    label: 'M T F',
    consonnes: ['M', 'T', 'F'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config1.jpg',
  },
  {
    number: 2,
    label: 'J D P',
    consonnes: ['J', 'D', 'P'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config2.jpg',
  },
  {
    number: 3,
    label: 'B N UI',
    consonnes: ['B', 'N', 'UI'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config3.jpg',
  },
  {
    number: 4,
    label: 'CH OUI L GN',
    consonnes: ['CH', 'OUI', 'L', 'GN'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config4.jpg',
  },
  {
    number: 5,
    label: 'K Z V Q',
    consonnes: ['K', 'Z', 'V', 'Q'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config5.jpg',
  },
  {
    number: 6,
    label: 'S R',
    consonnes: ['S', 'R'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config6.jpg',
  },
  {
    number: 7,
    label: 'G',
    consonnes: ['G'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config7.jpg',
  },
  {
    number: 8,
    label: 'ING LLE Y',
    consonnes: ['ING', 'LLE', 'Y'],
    image_url: 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config8.jpg',
  },
];

export default function BasicsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>📖 Les bases du code LFPC</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Apprenez les différentes configurations de main du code LFPC
        </Text>

        <View style={styles.voyellesContainer}>
          <Image
            source={require('../../../assets/images/voyelles_all.jpg')}
            style={styles.voyellesImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.gridContainer}>
          {CONFIGURATIONS.map((config) => (
            <View key={config.number} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.cardHeader, { backgroundColor: colors.border }]}>
                <Text style={[styles.cardNumber, { color: colors.text }]}>Configuration {config.number}</Text>
              </View>

              <View style={[styles.imageContainer, { backgroundColor: '#FFFFFF' }]}>
                <Image
                  source={{ uri: config.image_url }}
                  style={styles.signImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.consonnesSection}>
                  <Text style={[styles.consonnesLabel, { color: colors.textSecondary }]}>Consonnes :</Text>
                  <View style={styles.consonnesList}>
                    {config.consonnes.map((consonne, idx) => (
                      <View key={idx} style={styles.consonneChip}>
                        <Text style={styles.consonneText}>{consonne}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    lineHeight: 24,
  },
  voyellesContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  voyellesImage: {
    width: '100%',
    height: 400,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    width: '48%',
    minWidth: 140,
    marginBottom: 8,
  },
  cardHeader: {
    backgroundColor: '#334155',
    padding: 12,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContainer: {
    backgroundColor: '#0F172A',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  signImage: {
    width: 180,
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 16,
    textAlign: 'center',
  },
  consonnesSection: {
    marginTop: 8,
  },
  consonnesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  consonnesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  consonneChip: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  consonneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
