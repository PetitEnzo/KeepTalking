import { View, Text, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PolitiqueDeConfidentialiteScreen() {
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
          <Text style={styles.lastUpdated}>Dernière mise à jour : 1 avril 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Données collectées</Text>
            <Text style={styles.text}>
              Dans le cadre de l'utilisation de KeepTalking, nous pouvons collecter notamment :
            </Text>
            <Text style={styles.bulletPoint}>• Données d'identification : adresse e-mail, nom d'utilisateur</Text>
            <Text style={styles.bulletPoint}>• Données d'usage : progression, scores, statistiques, badges</Text>
            <Text style={styles.bulletPoint}>• Données techniques : informations de connexion et données nécessaires au fonctionnement du service</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Finalité du traitement</Text>
            <Text style={styles.text}>
              Les données sont traitées pour :
            </Text>
            <Text style={styles.bulletPoint}>• Fournir le service et permettre l'accès aux fonctionnalités</Text>
            <Text style={styles.bulletPoint}>• Assurer le suivi de votre apprentissage</Text>
            <Text style={styles.bulletPoint}>• Améliorer la plateforme et la sécurité</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Base légale</Text>
            <Text style={styles.text}>
              Les traitements sont fondés sur :
            </Text>
            <Text style={styles.bulletPoint}>• L'exécution du contrat (fourniture du service)</Text>
            <Text style={styles.bulletPoint}>• L'intérêt légitime (sécurité, prévention de la fraude, amélioration du service)</Text>
            <Text style={styles.bulletPoint}>• Le respect d'obligations légales, le cas échéant</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Durée de conservation</Text>
            <Text style={styles.text}>
              Nous conservons vos données le temps nécessaire aux finalités décrites ci-dessus. Vous pouvez demander la suppression de votre compte à tout moment. Certaines données peuvent être conservées plus longtemps si la loi l'exige.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Droits des utilisateurs</Text>
            <Text style={styles.text}>
              Conformément au RGPD, vous disposez notamment des droits suivants :
            </Text>
            <Text style={styles.bulletPoint}>• Droit d'accès</Text>
            <Text style={styles.bulletPoint}>• Droit de rectification</Text>
            <Text style={styles.bulletPoint}>• Droit à la suppression</Text>
            <Text style={styles.bulletPoint}>• Droit d'opposition</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Contact pour exercer vos droits</Text>
            <Text style={styles.text}>
              Pour exercer vos droits ou pour toute question relative à cette politique, vous pouvez nous contacter à : enzopetit33800@gmail.com
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Transfert hors UE</Text>
            <Text style={styles.text}>
              Nous ne procédons à aucun transfert intentionnel de vos données personnelles en dehors de l'Union européenne. Si cela devait évoluer, cette politique serait mise à jour.
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
