-- KeepTalking - Seed Data
-- Sample lessons and exercises for testing

-- ============================================
-- SEED DATA: Lessons
-- ============================================

INSERT INTO lessons (lesson_id, title, description, difficulty, order_number, is_published) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Introduction au LfPC', 'Découvrez les bases du Langage français Parlé Complété', 'beginner', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Les consonnes - Groupe 1', 'Apprenez les premières consonnes en LfPC', 'beginner', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Les voyelles', 'Maîtrisez les positions des voyelles', 'beginner', 3, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Les consonnes - Groupe 2', 'Continuez avec les consonnes avancées', 'intermediate', 4, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Combinaisons syllabiques', 'Pratiquez les combinaisons consonnes-voyelles', 'intermediate', 5, false);

-- ============================================
-- SEED DATA: Exercises
-- ============================================

-- Lesson 1: Introduction au LfPC
INSERT INTO exercises (exercise_id, lesson_id, type, question, correct_answer, options, images, points, order_number) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'multiple_choice',
    'Que signifie LfPC ?',
    'Langage français Parlé Complété',
    '["Langage français Parlé Complété", "Langage français Pour Communiquer", "Langue française Parlée Codée", "Langage français Pratique et Clair"]'::jsonb,
    NULL,
    10,
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'multiple_choice',
    'À quoi sert le LfPC ?',
    'À compléter la lecture labiale',
    '["À compléter la lecture labiale", "À remplacer la langue des signes", "À apprendre à parler", "À écrire plus vite"]'::jsonb,
    NULL,
    10,
    2
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'recognition',
    'Combien de positions de main existe-t-il en LfPC ?',
    '5',
    NULL,
    NULL,
    15,
    3
  );

-- Lesson 2: Les consonnes - Groupe 1
INSERT INTO exercises (exercise_id, lesson_id, type, question, correct_answer, options, images, points, order_number) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'multiple_choice',
    'Quelle position de main représente les consonnes D, P, J ?',
    'Position côté',
    '["Position côté", "Position bouche", "Position menton", "Position pommette", "Position gorge"]'::jsonb,
    NULL,
    10,
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'recognition',
    'Combien de doigts sont levés pour la consonne P ?',
    '1',
    NULL,
    NULL,
    15,
    2
  ),
  (
    '650e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'comprehension',
    'Identifiez la consonne montrée dans l''image',
    'D',
    '["D", "P", "J", "K", "V"]'::jsonb,
    '["https://example.com/lfpc/consonnes/d.jpg"]'::jsonb,
    20,
    3
  );

-- Lesson 3: Les voyelles
INSERT INTO exercises (exercise_id, lesson_id, type, question, correct_answer, options, images, points, order_number) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    'multiple_choice',
    'Combien de positions de voyelles existe-t-il ?',
    '5',
    '["3", "4", "5", "6", "7"]'::jsonb,
    NULL,
    10,
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440003',
    'recognition',
    'Quelle voyelle est représentée par la main près de la bouche ?',
    'A',
    NULL,
    NULL,
    15,
    2
  ),
  (
    '650e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440003',
    'production',
    'Montrez la position de la voyelle "I"',
    'Position menton',
    NULL,
    NULL,
    20,
    3
  );

-- Lesson 4: Les consonnes - Groupe 2
INSERT INTO exercises (exercise_id, lesson_id, type, question, correct_answer, options, images, points, order_number) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440004',
    'multiple_choice',
    'Quelle position représente les consonnes K, V, Z ?',
    'Position bouche',
    '["Position côté", "Position bouche", "Position menton", "Position pommette", "Position gorge"]'::jsonb,
    NULL,
    10,
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440004',
    'comprehension',
    'Identifiez la consonne montrée',
    'V',
    '["K", "V", "Z", "D", "P"]'::jsonb,
    '["https://example.com/lfpc/consonnes/v.jpg"]'::jsonb,
    20,
    2
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE lessons IS 'Seed data includes 5 lessons with varying difficulty levels';
COMMENT ON TABLE exercises IS 'Seed data includes sample exercises for the first 4 lessons';
