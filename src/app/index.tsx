import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          KeepTalking
        </Text>
        <Text style={styles.subtitle}>
          Apprenez le LfPC
        </Text>
        
        <View style={styles.buttonsContainer}>
          <Link href="/(auth)/signup" asChild>
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>
                Commencer
              </Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>
                Connexion
              </Text>
            </Pressable>
          </Link>

          <Link href="/about" asChild>
            <Pressable style={({ pressed }) => [styles.tertiaryButton, pressed && styles.tertiaryButtonPressed]}>
              <Text style={styles.tertiaryButtonText}>
                À propos
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 448,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
  },
  primaryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  tertiaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
  },
  tertiaryButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  tertiaryButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});
