import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AboutTabScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          À propos de KeepTalking
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Notre Mission
          </Text>
          <Text style={styles.text}>
            Rendre l'apprentissage du Langage Français Parlé Complété (LfPC) accessible à tous, 
            partout, à tout moment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Qu'est-ce que le LfPC ?
          </Text>
          <Text style={styles.text}>
            Le Langage Français Parlé Complété est un code gestuel qui complète la lecture labiale. 
            Il permet aux personnes sourdes ou malentendantes de percevoir visuellement tous les sons 
            de la langue française.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Comment ça marche ?
          </Text>
          <Text style={styles.text}>
            Le LfPC utilise 8 configurations de main et 5 positions autour du visage pour représenter 
            les différents sons de la langue française. Chaque syllabe est codée par une configuration 
            et une position.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Pourquoi KeepTalking ?
          </Text>
          <Text style={styles.text}>
            • Apprentissage ludique avec système de progression{'\n'}
            • Sessions courtes adaptées à tous les emplois du temps{'\n'}
            • Assistant intelligent pour pratiquer{'\n'}
            • Suivi de vos progrès en temps réel{'\n'}
            • Accessible 24/7 depuis n'importe quel appareil{'\n'}
            • Gratuit et accessible à tous
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            Notre Impact
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Utilisateurs actifs</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Leçons complétées</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2K+</Text>
              <Text style={styles.statLabel}>Heures d'apprentissage</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contact
          </Text>
          <Text style={styles.text}>
            Pour toute question ou suggestion, n'hésitez pas à nous contacter à :{'\n'}
            contact@keeptalking.fr
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 KeepTalking - Tous droits réservés
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#0F172A',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
