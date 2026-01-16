export const APP_NAME = 'KeepTalking';
export const APP_VERSION = '0.1.0';

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const EXERCISE_TYPES = {
  RECOGNITION: 'recognition',
  PRODUCTION: 'production',
  COMPREHENSION: 'comprehension',
} as const;

export const COLORS = {
  // Palette moderne et sobre
  primary: '#2563EB',      // Bleu moderne
  secondary: '#7C3AED',    // Violet
  accent: '#10B981',       // Vert émeraude
  neutral: '#64748B',      // Gris ardoise
  
  // Couleurs fonctionnelles
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  
  // Textes
  text: '#0F172A',         // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8',    // Slate 400
} as const;
