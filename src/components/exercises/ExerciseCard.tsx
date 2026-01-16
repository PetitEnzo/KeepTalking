import { View, Text, Pressable } from 'react-native';
import { Exercise } from '../../types';
import { Card } from '../ui/Card';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const typeLabels = {
    recognition: 'Reconnaissance',
    production: 'Production',
    comprehension: 'Compréhension',
  };

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-gray-800 flex-1">
            {exercise.content.question}
          </Text>
          <View className={`px-3 py-1 rounded-full ${difficultyColors[exercise.difficulty]}`}>
            <Text className="text-xs font-medium capitalize">
              {exercise.difficulty}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-600">
          Type: {typeLabels[exercise.type]}
        </Text>
      </Card>
    </Pressable>
  );
}
