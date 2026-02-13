import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AboutTabScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          À propos de KeepTalking
        </Text>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notre Mission
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Rendre l'apprentissage du Langage Français Parlé Complété (LfPC) accessible à tous, 
            partout, à tout moment.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Qu'est-ce que le LfPC ?
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Le Langage Français Parlé Complété est un code gestuel qui complète la lecture labiale. 
            Il permet aux personnes sourdes ou malentendantes de percevoir visuellement tous les sons 
            de la langue française.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comment ça marche ?
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Le LfPC utilise 8 configurations de main et 5 positions autour du visage pour représenter 
            les différents sons de la langue française. Chaque syllabe est codée par une configuration 
            et une position.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pourquoi KeepTalking ?
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            • Apprentissage ludique avec système de progression{'\n'}
            • Sessions courtes adaptées à tous les emplois du temps{'\n'}
            • Assistant intelligent pour pratiquer{'\n'}
            • Suivi de vos progrès en temps réel{'\n'}
            • Accessible 24/7 depuis n'importe quel appareil{'\n'}
            • Gratuit et accessible à tous
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Pour toute question ou suggestion, n'hésitez pas à me contacter à :{'\n'}
            enzopetit33800@gmail.com
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
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
