import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />

      {/* HERO SECTION */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Image
            source={require('../../assets/images/logoWhiteBlack.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />

          <Text style={styles.heroTitle}>
            Apprendre le LfPC n'a jamais été aussi simple
          </Text>

          <Text style={styles.heroSubtitle}>
            Plateforme d'apprentissage moderne pour maîtriser le Langage Français Parlé Complété
          </Text>

          <View style={styles.heroIllustration}>
            <Text style={styles.heroEmoji}>🤟👄</Text>
            <Text style={styles.heroIllustrationText}>
              Communication visuelle accessible
            </Text>
          </View>

          <Link href="/" asChild>
            <Pressable style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
              <Text style={styles.ctaButtonText}>
                Commencer gratuitement
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* SECTION PROBLÈME */}
      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>
            Pourquoi le LfPC ?
          </Text>

          <Text style={styles.sectionSubtitle}>
            80% des enfants sourds naissent dans des familles entendantes qui ne connaissent pas le LfPC
          </Text>

          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.cardEmoji}>💰</Text>
              </View>
              <Text style={styles.cardTitle}>Cours coûteux</Text>
              <Text style={styles.cardText}>
                Les formations en présentiel coûtent entre 500€ et 1000€
              </Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.cardEmoji}>📚</Text>
              </View>
              <Text style={styles.cardTitle}>Ressources dispersées</Text>
              <Text style={styles.cardText}>
                Les supports d'apprentissage sont éparpillés et peu interactifs
              </Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.cardEmoji}>⏰</Text>
              </View>
              <Text style={styles.cardTitle}>Manque de pratique</Text>
              <Text style={styles.cardText}>
                Difficile de mémoriser sans pratique quotidienne
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION SOLUTION */}
      <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>
            KeepTalking : Apprendre en s'amusant
          </Text>

          <Text style={styles.sectionSubtitle}>
            Une approche moderne et ludique pour maîtriser le LfPC à votre rythme
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.featureEmoji}>🎮</Text>
              </View>
              <Text style={styles.featureTitle}>Apprentissage ludique</Text>
              <Text style={styles.featureText}>
                Système de progression avec points et récompenses
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.featureEmoji}>⏱️</Text>
              </View>
              <Text style={styles.featureTitle}>Sessions courtes</Text>
              <Text style={styles.featureText}>
                Modules de 5 à 15 minutes adaptés à tous
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.featureEmoji}>💬</Text>
              </View>
              <Text style={styles.featureTitle}>Assistant intelligent</Text>
              <Text style={styles.featureText}>
                Pratiquez avec notre chatbot conversationnel
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION MISSION */}
      <View style={styles.missionSection}>
        <View style={styles.sectionContent}>
          <Text style={styles.missionTitle}>
            Notre mission
          </Text>

          <View style={styles.missionQuote}>
            <Text style={styles.missionQuoteText}>
              "Rendre l'apprentissage du LfPC accessible à tous, partout, à tout moment"
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Utilisateurs actifs</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Leçons complétées</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>2K+</Text>
              <Text style={styles.statLabel}>Heures d'apprentissage</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA FINAL */}
      <View style={styles.ctaSection}>
        <View style={styles.sectionContent}>
          <Image
            source={require('../../assets/images/logoWhiteBlack.png')}
            style={styles.ctaLogo}
            resizeMode="contain"
          />

          <Text style={styles.ctaTitle}>
            Prêt à commencer ?
          </Text>

          <Text style={styles.ctaSubtitle}>
            Rejoignez des centaines d'apprenants et commencez votre voyage dans le monde du LfPC
          </Text>

          <Link href="/" asChild>
            <Pressable style={({ pressed }) => [styles.ctaButtonPrimary, pressed && styles.ctaButtonPrimaryPressed]}>
              <Text style={styles.ctaButtonPrimaryText}>
                Créer mon compte gratuitement
              </Text>
            </Pressable>
          </Link>

          <Link href="/" asChild>
            <Pressable style={styles.backLink}>
              <Text style={styles.backLinkText}>
                ← Retour à l'accueil
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 KeepTalking - Tous droits réservés
        </Text>
        <Text style={styles.footerSubtext}>
          Apprendre le LfPC de manière ludique et accessible
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // HERO
  hero: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  heroContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  heroLogo: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 800,
  },
  heroIllustration: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroIllustrationText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 20,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // SECTIONS
  section: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#F8FAFC',
  },
  sectionContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
  },
  
  // CARDS
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    flex: 1,
    minWidth: 280,
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  
  // FEATURES
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
  },
  feature: {
    flex: 1,
    minWidth: 250,
    maxWidth: 350,
    alignItems: 'center',
  },
  featureIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  featureEmoji: {
    fontSize: 48,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // MISSION
  missionSection: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  missionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  missionQuote: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 40,
    marginBottom: 64,
  },
  missionQuoteText: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 40,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  // CTA SECTION
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  ctaLogo: {
    width: 150,
    height: 150,
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 600,
  },
  ctaButtonPrimary: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 20,
    marginBottom: 16,
  },
  ctaButtonPrimaryPressed: {
    backgroundColor: '#1D4ED8',
  },
  ctaButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backLink: {
    marginTop: 48,
  },
  backLinkText: {
    color: '#64748B',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  
  // FOOTER
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
