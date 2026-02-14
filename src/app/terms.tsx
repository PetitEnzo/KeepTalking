import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TermsScreen() {
  return (
    <View style={styles.backgroundImage}>
      <ScrollView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.content}>
          <Text style={styles.title}>Conditions d'utilisation</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : 14 février 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
            <Text style={styles.text}>
              En accédant et en utilisant KeepTalking, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description du service</Text>
            <Text style={styles.text}>
              KeepTalking est une plateforme d'apprentissage en ligne dédiée à l'enseignement du Langage Français Parlé Complété (LfPC). 
              Nous proposons des leçons interactives, des exercices pratiques et des outils d'apprentissage pour faciliter la maîtrise du LfPC.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Inscription et compte utilisateur</Text>
            <Text style={styles.text}>
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la confidentialité 
              de vos identifiants et de toutes les activités effectuées sous votre compte.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Utilisation acceptable</Text>
            <Text style={styles.text}>
              Vous vous engagez à utiliser KeepTalking uniquement à des fins légales et conformément à ces conditions. 
              Il est interdit de :
            </Text>
            <Text style={styles.bulletPoint}>• Utiliser la plateforme de manière frauduleuse ou malveillante</Text>
            <Text style={styles.bulletPoint}>• Partager votre compte avec d'autres personnes</Text>
            <Text style={styles.bulletPoint}>• Copier, modifier ou distribuer le contenu sans autorisation</Text>
            <Text style={styles.bulletPoint}>• Perturber le fonctionnement de la plateforme</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Propriété intellectuelle</Text>
            <Text style={styles.text}>
              Tout le contenu de KeepTalking (textes, images, vidéos, logos) est protégé par les droits d'auteur et 
              appartient à KeepTalking ou à ses concédants de licence.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation de responsabilité</Text>
            <Text style={styles.text}>
              KeepTalking est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas que le service 
              sera ininterrompu ou exempt d'erreurs.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Modifications des conditions</Text>
            <Text style={styles.text}>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront effectives 
              dès leur publication sur la plateforme.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Contact</Text>
            <Text style={styles.text}>
              Pour toute question concernant ces conditions, veuillez nous contacter à : contact@keeptalking.fr
            </Text>
          </View>

          <Link href="/" style={styles.backLink}>
            <Text style={styles.backLinkText}>← Retour à l'accueil</Text>
          </Link>
        </View>
      </ScrollView>
    </View>
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
