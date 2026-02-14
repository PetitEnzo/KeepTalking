import { View, Text, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyScreen() {
  return (
    <ImageBackground 
      source={require('../../assets/images/photo-1615051179134-62696ea77ef9.avif')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.content}>
          <Text style={styles.title}>Politique de confidentialité</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : 14 février 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.text}>
              KeepTalking s'engage à protéger la confidentialité de vos données personnelles. Cette politique explique 
              comment nous collectons, utilisons et protégeons vos informations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Données collectées</Text>
            <Text style={styles.text}>
              Nous collectons les informations suivantes :
            </Text>
            <Text style={styles.bulletPoint}>• Informations d'identification : nom d'utilisateur, adresse e-mail</Text>
            <Text style={styles.bulletPoint}>• Données d'utilisation : progression dans les leçons, scores, statistiques</Text>
            <Text style={styles.bulletPoint}>• Données techniques : adresse IP, type de navigateur, système d'exploitation</Text>
            <Text style={styles.bulletPoint}>• Cookies et technologies similaires pour améliorer l'expérience utilisateur</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Utilisation des données</Text>
            <Text style={styles.text}>
              Vos données sont utilisées pour :
            </Text>
            <Text style={styles.bulletPoint}>• Fournir et améliorer nos services</Text>
            <Text style={styles.bulletPoint}>• Personnaliser votre expérience d'apprentissage</Text>
            <Text style={styles.bulletPoint}>• Communiquer avec vous concernant votre compte</Text>
            <Text style={styles.bulletPoint}>• Analyser l'utilisation de la plateforme pour l'améliorer</Text>
            <Text style={styles.bulletPoint}>• Assurer la sécurité et prévenir la fraude</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Partage des données</Text>
            <Text style={styles.text}>
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </Text>
            <Text style={styles.bulletPoint}>• Avec votre consentement explicite</Text>
            <Text style={styles.bulletPoint}>• Pour respecter une obligation légale</Text>
            <Text style={styles.bulletPoint}>• Avec des prestataires de services qui nous aident à exploiter la plateforme (hébergement, analyse)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Sécurité des données</Text>
            <Text style={styles.text}>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger 
              vos données contre tout accès non autorisé, modification, divulgation ou destruction.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Vos droits</Text>
            <Text style={styles.text}>
              Conformément au RGPD, vous disposez des droits suivants :
            </Text>
            <Text style={styles.bulletPoint}>• Droit d'accès à vos données personnelles</Text>
            <Text style={styles.bulletPoint}>• Droit de rectification de vos données</Text>
            <Text style={styles.bulletPoint}>• Droit à l'effacement de vos données</Text>
            <Text style={styles.bulletPoint}>• Droit à la limitation du traitement</Text>
            <Text style={styles.bulletPoint}>• Droit à la portabilité des données</Text>
            <Text style={styles.bulletPoint}>• Droit d'opposition au traitement</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Conservation des données</Text>
            <Text style={styles.text}>
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et 
              respecter nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Cookies</Text>
            <Text style={styles.text}>
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez configurer votre navigateur pour 
              refuser les cookies, mais cela peut affecter certaines fonctionnalités de la plateforme.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Modifications de la politique</Text>
            <Text style={styles.text}>
              Nous pouvons mettre à jour cette politique de confidentialité. Nous vous informerons de tout changement 
              important par e-mail ou via une notification sur la plateforme.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Contact</Text>
            <Text style={styles.text}>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              contactez-nous à : privacy@keeptalking.fr
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
  bulletPoint: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginLeft: 16,
    marginTop: 8,
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
