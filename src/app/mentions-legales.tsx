import { View, Text, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function MentionsLegalesScreen() {
  return (
    <ImageBackground
      source={require('../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.content}>
          <Text style={styles.title}>Mentions légales</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : 1 avril 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Éditeur du site</Text>
            <Text style={styles.text}>
              KeepTalking est édité par : Enzo Petit.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Hébergement</Text>
            <Text style={styles.text}>
              Le site est hébergé par : Vercel.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Contact</Text>
            <Text style={styles.text}>
              Pour toute question, vous pouvez nous contacter à : enzopetit33800@gmail.com
            </Text>
          </View>

          <Link href="/" style={styles.backLink}>
            <Text style={styles.backLinkText}>← Retour à l'accueil</Text>
          </Link>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  backLink: {
    marginTop: 32,
    marginBottom: 48,
    alignSelf: 'center',
  },
  backLinkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
