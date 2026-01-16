import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Card className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Tableau de bord
          </Text>
          <Text className="text-gray-600">
            Suivez votre progression dans l'apprentissage du LfPC
          </Text>
        </Card>

        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Progression
          </Text>
          <View className="bg-gray-200 rounded-full h-4 mb-2">
            <View className="bg-primary-500 h-4 rounded-full" style={{ width: '35%' }} />
          </View>
          <Text className="text-sm text-gray-600">35% complété</Text>
        </Card>

        <View className="space-y-3">
          <Button title="Continuer l'apprentissage" onPress={() => {}} />
          <Button title="Exercices" onPress={() => {}} variant="secondary" />
          <Button title="Profil" onPress={() => {}} variant="outline" />
        </View>
      </View>
    </ScrollView>
  );
}
