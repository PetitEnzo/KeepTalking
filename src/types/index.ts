export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  type: 'recognition' | 'production' | 'comprehension';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: ExerciseContent;
}

export interface ExerciseContent {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Progress {
  userId: string;
  exerciseId: string;
  completed: boolean;
  score: number;
  attempts: number;
  lastAttempt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  exercises: Exercise[];
}
