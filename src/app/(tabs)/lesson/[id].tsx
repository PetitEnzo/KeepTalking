import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../services/supabase';

interface LessonSection {
  type: 'text' | 'quiz' | 'info' | 'practice' | 'image' | 'multipart_quiz';
  title?: string;
  content?: string;
  question?: string;
  options?: string[];
  optionImages?: string[]; // imageKeys pour les options de quiz
  optionImageUrls?: string[]; // URLs chargées pour les images des options
  correctAnswer?: number;
  explanation?: string;
  imageKey?: string;
  imageUrl?: string;
  // Pour multipart_quiz
  configurationOptions?: string[]; // imageKeys des configurations
  configurationImageUrls?: string[]; // URLs des configurations
  positionOptions?: string[]; // descriptions des positions
  correctConfiguration?: number; // index de la bonne configuration
  correctPosition?: number; // index de la bonne position
}

const lessonContent: { [key: string]: { title: string; sections: LessonSection[] } } = {
  '1': {
    title: 'Introduction au LFPC',
    sections: [
      {
        type: 'text',
        title: 'Bienvenue dans votre première leçon !',
        content: 'Le Langage Français Parlé Complété (LFPC) est un outil de communication visuelle qui complète la lecture labiale. Il permet aux personnes sourdes ou malentendantes de percevoir visuellement tous les sons de la langue française.',
      },
      {
        type: 'info',
        title: 'Pourquoi le LFPC ?',
        content: 'La lecture labiale seule ne permet de distinguer que 30% des sons. Le LFPC complète cette lecture en ajoutant des gestes manuels, permettant ainsi de percevoir 100% des sons de la parole.',
      },
      {
        type: 'text',
        title: 'Les deux composantes du LFPC',
        content: 'Le LFPC utilise deux éléments essentiels :\n\n1. **8 configurations de main** : Des formes différentes de la main qui représentent des groupes de consonnes.\n\n2. **5 positions autour du visage** : Des emplacements précis où placer la main pour représenter les voyelles.',
      },
      {
        type: 'quiz',
        question: 'Combien de configurations de main existe-t-il en LFPC ?',
        options: ['5 configurations', '8 configurations', '10 configurations', '12 configurations'],
        correctAnswer: 1,
        explanation: 'Il existe exactement 8 configurations de main en LFPC, chacune représentant un groupe de consonnes.',
      },
      {
        type: 'text',
        title: 'Comment ça fonctionne ?',
        content: 'Chaque syllabe est codée par une configuration de main (pour la consonne) et une position (pour la voyelle).\n\nPar exemple, pour dire "papa" :\n- "pa" = configuration P + position A\n- "pa" = configuration P + position A',
      },
      {
        type: 'info',
        title: 'Le saviez-vous ?',
        content: 'Le LFPC a été inventé en 1967 par le Dr. R. Orin Cornett aux États-Unis, puis adapté au français en 1977. Aujourd\'hui, il est utilisé dans plus de 60 pays !',
      },
      {
        type: 'quiz',
        question: 'Que représentent les 5 positions autour du visage ?',
        options: ['Les consonnes', 'Les voyelles', 'Les syllabes', 'Les mots'],
        correctAnswer: 1,
        explanation: 'Les 5 positions autour du visage représentent les voyelles, tandis que les 8 configurations de main représentent les consonnes.',
      },
      {
        type: 'text',
        title: 'Les avantages du LFPC',
        content: '✓ Accès complet à la langue française\n✓ Amélioration de la lecture et de l\'écriture\n✓ Développement du langage oral\n✓ Facilite l\'apprentissage des langues étrangères\n✓ Renforce les liens familiaux',
      },
      {
        type: 'practice',
        title: 'Prêt pour la suite ?',
        content: 'Dans la prochaine leçon, vous découvrirez en détail les 8 configurations de main et comment les former correctement.\n\nFélicitations pour avoir terminé cette introduction ! 🎉',
      },
    ],
  },
  '2': {
    title: 'Les 8 configurations de main',
    sections: [
      {
        type: 'text',
        title: 'Les 8 configurations essentielles',
        content: 'En LFPC, il existe 8 configurations de main différentes. Chaque configuration représente un groupe de consonnes qui se ressemblent visuellement sur les lèvres.\n\nCes configurations permettent de distinguer clairement toutes les consonnes de la langue française.',
      },
      {
        type: 'info',
        title: 'Pourquoi 8 configurations ?',
        content: 'Le nombre 8 a été choisi car il permet de couvrir toutes les consonnes françaises de manière optimale, en regroupant celles qui sont visuellement similaires sur les lèvres.',
      },
      {
        type: 'image',
        title: 'Configuration 1 : Main ouverte',
        imageKey: 'M',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : M, T, F\n\nMain ouverte, tous les doigts tendus.\n\nUtilisé pour : "Maman", "Tarte", "Feu"',
      },
      {
        type: 'image',
        title: 'Configuration 2 : Index tendu',
        imageKey: 'J',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : J, D, P\n\nMain fermé, index tendu.\n\nUtilisé pour : "Joue", "Dodo", "Papa"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration utilise-t-on pour les consonnes J, D, P ?',
        options: ['Configuration 1', 'Configuration 2', 'Configuration 5', 'Configuration 3'],
        optionImages: ['M', 'J', 'K', 'B'],
        correctAnswer: 1,
        explanation: 'La configuration 2 (main fermé, index tendu) est utilisée pour les consonnes J, D et P.',
      },
      {
        type: 'image',
        title: 'Configuration 3 : Quatre doigts',
        imageKey: 'B',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : B, N, UI\n\nQuatre doigts, pouce rentré.\n\nUtilisé pour : "Bébé", "Nez", "Nuit"',
      },
      {
        type: 'image',
        title: 'Configuration 4 : Pouce et index',
        imageKey: 'L',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : CH, OU, L, GN\n\nMain fermé, pouce et index tendu.\n\nUtilisé pour : "Chat", "Oui", "Lune", "Montagne"',
      },
      {
        type: 'image',
        title: 'Configuration 5 : Index et majeur',
        imageKey: 'K',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : K, Z, V\n\nMain fermé, index et majeur tendu.\n\nUtilisé pour : "Kiwi", "Zéro", "Vélo"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration correspond aux consonnes CH, OU, L, GN ?',
        options: ['Configuration 3', 'Configuration 4', 'Configuration 6', 'Configuration 7'],
        optionImages: ['B', 'L', 'S', 'G'],
        correctAnswer: 1,
        explanation: 'La configuration 4 (main fermé, pouce et index tendu) est utilisée pour les consonnes CH, OU, L, GN.',
      },
      {
        type: 'image',
        title: 'Configuration 6 : Trois doigts et demi',
        imageKey: 'S',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : S, R\n\nAuriculaire, annulaire et majeur, index demi fermé.\n\nUtilisé pour : "Soleil", "Rue"',
      },
      {
        type: 'image',
        title: 'Configuration 7 : Trois doigts tendus',
        imageKey: 'G',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : G\n\nMain fermé, pouce index et majeur tendu.\n\nUtilisé pour : "Gare"',
      },
      {
        type: 'image',
        title: 'Configuration 8 : Index et majeur écartés',
        imageKey: 'ING',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Consonnes : ING, LLE\n\nMain fermé, index et majeur tendu et ecarté.\n\nUtilisé pour : "Parking", "Fille"',
      },
      {
        type: 'quiz',
        question: 'Quelle configuration correspond aux consonnes S, R ?',
        options: ['Configuration 5', 'Configuration 6', 'Configuration 7', 'Configuration 8'],
        optionImages: ['K', 'S', 'G', 'ING'],
        correctAnswer: 1,
        explanation: 'La configuration 6 (auriculaire annulaire et majeur, index demi fermé) est utilisée pour les consonnes S et R.',
      },
      {
        type: 'info',
        title: 'Astuce pour mémoriser',
        content: 'Pour retenir les configurations, pratiquez-les dans l\'ordre (1 à 8) en répétant les consonnes associées. Avec de la pratique, vos mains formeront automatiquement la bonne configuration !',
      },
      {
        type: 'practice',
        title: 'Entraînez-vous !',
        content: 'Maintenant que vous connaissez les 8 configurations, entraînez-vous à les former avec votre main.\n\nDans la prochaine leçon, vous apprendrez les 5 positions autour du visage pour coder les voyelles.\n\nBravo pour avoir terminé cette leçon ! 🎉',
      },
    ],
  },
  '3': {
    title: 'Les 5 positions autour du visage',
    sections: [
      {
        type: 'text',
        title: 'Les 5 positions pour les voyelles',
        content: 'En LFPC, les voyelles sont représentées par 5 positions différentes de la main autour du visage.\n\nChaque position correspond à un groupe de voyelles qui se ressemblent visuellement sur les lèvres.',
      },
      {
        type: 'image',
        title: 'Pourquoi 5 positions ?',
        imageKey: 'voyelles_all',
        imageUrl: 'LOCAL_ASSET',
        content: 'Les 5 positions permettent de distinguer clairement toutes les voyelles françaises. Combinées aux 8 configurations de main, elles permettent de coder toutes les syllabes de la langue française.',
      },
      {
        type: 'quiz',
        question: 'Combien de positions autour du visage existe-t-il en LFPC ?',
        options: ['3 positions', '5 positions', '8 positions', '10 positions'],
        correctAnswer: 1,
        explanation: 'Il existe exactement 5 positions autour du visage en LFPC, chacune représentant un groupe de voyelles.',
      },
      {
        type: 'image',
        title: 'Position 1',
        imageKey: '1',
        imageUrl: 'LOAD_FROM_POSITIONS',
        content: 'Position 1 - Chargement depuis hand_positions...',
      },
      {
        type: 'image',
        title: 'Position 2',
        imageKey: '2',
        imageUrl: 'LOAD_FROM_POSITIONS',
        content: 'Position 2 - Chargement depuis hand_positions...',
      },
      {
        type: 'quiz',
        question: 'Quelle position utilise-t-on pour les voyelles VOYELLES_POSITION_2 ?\n\nEXAMPLES_POSITION_2',
        options: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4'],
        correctAnswer: 1,
        explanation: 'La position 2 est utilisée pour les voyelles incluant O.',
      },
      {
        type: 'image',
        title: 'Position 3',
        imageKey: '3',
        imageUrl: 'LOAD_FROM_POSITIONS',
        content: 'Position 3 - Chargement depuis hand_positions...',
      },
      {
        type: 'image',
        title: 'Position 4',
        imageKey: '4',
        imageUrl: 'LOAD_FROM_POSITIONS',
        content: 'Position 4 - Chargement depuis hand_positions...',
      },
      {
        type: 'quiz',
        question: 'Quelle position utilise-t-on pour les voyelles VOYELLES_POSITION_4 ?\n\nEXAMPLES_POSITION_4',
        options: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4'],
        correctAnswer: 3,
        explanation: 'La position 4 est utilisée pour les voyelles incluant I.',
      },
      {
        type: 'image',
        title: 'Position 5',
        imageKey: '5',
        imageUrl: 'LOAD_FROM_POSITIONS',
        content: 'Position 5 - Chargement depuis hand_positions...',
      },
      {
        type: 'info',
        title: 'Astuce pour mémoriser',
        content: 'Pour retenir les positions, imaginez un parcours autour de votre visage.\n\nAvec de la pratique, vos mains se placeront automatiquement à la bonne position !',
      },
      {
        type: 'practice',
        title: 'Entraînez-vous !',
        content: 'Maintenant que vous connaissez les 5 positions autour du visage, entraînez-vous à les placer correctement.\n\nFélicitations pour avoir terminé cette leçon ! 🎉',
      },
    ],
  },
  '4': {
    title: 'Vos premiers mots en LFPC',
    sections: [
      {
        type: 'text',
        title: 'Coder vos premiers mots',
        content: 'Maintenant que vous connaissez les 8 configurations de main et les 5 positions autour du visage, vous êtes prêt à coder vos premiers mots en LFPC !\n\nChaque syllabe se code en combinant une configuration (consonne) et une position (voyelle).',
      },
      {
        type: 'info',
        title: 'Comment coder une syllabe ?',
        content: 'Pour coder une syllabe, suivez ces 3 étapes :\n\n1. Identifiez la consonne → Choisissez la configuration de main\n2. Identifiez la voyelle → Choisissez la position autour du visage\n3. Combinez les deux en parlant naturellement',
      },
      {
        type: 'text',
        title: 'Mot 1 : PAPA',
        content: 'Le mot "PAPA" se compose de deux syllabes identiques : PA + PA.\n\nPour coder chaque syllabe "PA", vous devez combiner :\n- La configuration pour la consonne P\n- La position pour la voyelle A',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder la syllabe "PA" dans "PAPA", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 1,
        correctPosition: 1,
        explanation: 'Pour "PA" : Configuration J (pour P, D, J) + Position 2 (Main à l\'écart du visage pour A, O, E).',
      },
      {
        type: 'text',
        title: 'Mot 2 : MAMAN',
        content: 'Le mot "MAMAN" se compose de deux syllabes : MA + MAN.\n\nPour la syllabe "MA", vous devez combiner :\n- La configuration pour la consonne M\n- La position pour la voyelle A',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder la syllabe "MA" dans "MAMAN", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 0,
        correctPosition: 1,
        explanation: 'Pour "MA" : Configuration M (pour M, T, F) + Position 2 (Main à l\'écart du visage pour A, O, E).',
      },
      {
        type: 'text',
        title: 'La syllabe "MAN"',
        content: 'Pour la deuxième partie du mot "MAMAN", la syllabe "MAN" se code :\n\n- Consonne M → Configuration M (M, T, F)\n- Voyelle AN → Position à côté de la bouche\n\nAN est une voyelle nasale qui se code avec la position à côté de la bouche.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder la syllabe "MAN" dans "MAMAN", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 0,
        correctPosition: 2,
        explanation: 'Pour "MAN" : Configuration M (pour M, T, F) + Position 3 (Main à côté de la bouche pour I, ON, AN).',
      },
      {
        type: 'text',
        title: 'Mot 3 : BÉBÉ',
        content: 'Le mot "BÉBÉ" se compose de deux syllabes identiques : BÉ + BÉ.\n\nPour coder chaque syllabe "BÉ", vous devez combiner :\n- La configuration pour la consonne B\n- La position pour la voyelle É',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder la syllabe "BÉ" dans "BÉBÉ", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 2,
        correctPosition: 4,
        explanation: 'Pour "BÉ" : Configuration B (pour B, N, UI) + Position 5 (Main au niveau du cou pour TU, É, UN).',
      },
      {
        type: 'text',
        title: 'Mot 4 : MOTO',
        content: 'Le mot "MOTO" se compose de deux syllabes : MO + TO.\n\nPour la syllabe "MO", vous devez combiner :\n- La configuration pour la consonne M\n- La position pour la voyelle O',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder la syllabe "MO" dans "MOTO", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 0,
        correctPosition: 3,
        explanation: 'Pour "MO" : Configuration M (pour M, T, F) + Position 4 (Main au niveau du menton pour È, OU, O).',
      },
      {
        type: 'info',
        title: 'Astuce pour les mots',
        content: 'Pour bien coder un mot :\n\n1. Décomposez-le en syllabes\n2. Pour chaque syllabe, identifiez consonne + voyelle\n3. Parlez naturellement en ajoutant les gestes\n4. Pratiquez lentement au début, puis accélérez\n\nLa fluidité viendra avec la pratique !',
      },
      {
        type: 'practice',
        title: 'À vous de jouer !',
        content: 'Entraînez-vous à coder ces mots simples :\n\n- PAPA (PA + PA)\n- MAMAN (MA + MAN)\n- BÉBÉ (BÉ + BÉ)\n- MOTO (MO + TO)\n\nCommencez lentement, décomposez chaque syllabe, et parlez en même temps que vous codez.\n\nFélicitations ! Vous savez maintenant coder vos premiers mots en LFPC ! 🎉',
      },
    ],
  },
  '5': {
    title: 'Combinaisons avancées',
    sections: [
      {
        type: 'text',
        title: 'Bienvenue au niveau intermédiaire !',
        content: 'Vous maîtrisez les bases du LFPC : les 8 configurations de main et les 5 positions autour du visage. Il est temps de passer à la vitesse supérieure avec les combinaisons avancées !\n\nDans ce cours, vous allez apprendre à enchaîner plusieurs syllabes rapidement et avec précision.',
      },
      {
        type: 'info',
        title: 'Pré-requis',
        content: '✓ Connaître les 8 configurations de main\n✓ Maîtriser les 5 positions autour du visage\n✓ Savoir coder des mots simples (PAPA, MAMAN, etc.)\n✓ Comprendre le principe syllabe = consonne + voyelle',
      },
      {
        type: 'info',
        title: 'Ce que vous allez savoir faire',
        content: 'Enchaîner plusieurs syllabes rapidement\nÉviter les erreurs de coarticulation\nCoder des mots plus complexes avec précision\nIdentifier et corriger les ambiguïtés\nUtiliser une méthode reproductible pour tout mot',
      },
      {
        type: 'text',
        title: 'Rappel : Les 5 positions',
        content: 'Petit rappel des positions que vous connaissez :\n\n1️⃣ Main sous l\'œil → IN, EU\n2️⃣ Main à l\'écart du visage → A, O, E\n3️⃣ Main à côté de la bouche → I, ON, AN\n4️⃣ Main au niveau du menton → È, OU, O\n5️⃣ Main au niveau du cou → U, É, UN',
      },
      {
        type: 'text',
        title: 'Nouvelle notion : L\'enchaînement avancé',
        content: 'Un enchaînement avancé, c\'est quand vous codez plusieurs syllabes à la suite dans un mot ou une phrase.\n\n3 règles d\'or :\n\n1. Précision : Chaque position doit être claire, même en vitesse\n2. Fluidité : Passez d\'une position à l\'autre sans à-coups\n3. Synchronisation : La main bouge EN MÊME TEMPS que vous prononcez',
      },
      {
        type: 'image',
        title: 'Méthode en 4 étapes',
        imageKey: 'word/chocolat.jpg',
        content: '1. DÉCOUPER → Séparez le mot en syllabes\n\n2. CODER → Identifiez config + position pour chaque syllabe\n\n3. ENCHAÎNER → Pratiquez l\'enchaînement lentement\n\n4. VÉRIFIER → Accélérez et vérifiez la précision\n\nExemple : CHOCOLAT\n→ CHO-CO-LAT\n→ CH(config 4)+O(pos 4) / CO(config 5)+O(pos 4) / LA(config 4)+A(pos 2)',
      },
      {
        type: 'text',
        title: 'Exercice 1 : BONJOUR (facile)',
        content: 'Commençons avec un mot que vous connaissez : BONJOUR\n\nDécomposition : BON-JOU-R\n\nBON :\n- B → Configuration B\n- ON → Position à côté de la bouche (voyelle nasale)\n\nJOU :\n- J → Configuration J (P, D, J)\n- OU → Position au niveau du menton\n\nR :\n- R → Configuration R (seule, consonne finale)',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "BON" dans "BONJOUR", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 2,
        correctPosition: 2,
        explanation: 'Pour "BON" : Configuration B (pour B, N, UI) + Position 3 (Main à côté de la bouche pour ON).\n\nErreur fréquente : Confondre ON et AN (même position, mais prononciation différente).',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "JOU" dans "BONJOUR", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 1,
        correctPosition: 3,
        explanation: 'Pour "JOU" : Configuration J (pour P, D, J) + Position 4 (Main au niveau du menton pour OU).\n\nAstuces : OU se prononce comme dans "mou", "fou".',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "R" dans "BONJOUR", sélectionnez la configuration :',
        configurationOptions: ['M', 'J', 'B', 'R'],
        correctConfiguration: 3,
        explanation: 'Pour "R" : Configuration R (pour S, R, Z).\n\nR est une consonne finale, sans voyelle après.',
      },
      {
        type: 'text',
        title: 'Exercice 2 : MERCI (moyen)',
        content: 'Passons à un mot plus rapide : MERCI\n\nDécomposition : ME-R-CI\n\nME :\n- M → Configuration M\n- E → Position au niveau du menton\n\nR :\n- R → Configuration R (consonne seule)\n\nCI :\n- S → Configuration S (pour S, R)\n- I → Position à côté de la bouche',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "ME" dans "MERCI", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'R'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 0,
        correctPosition: 3,
        explanation: 'Pour "ME" : Configuration M + Position 4 (Main au niveau du menton pour E).\n\nAttention : E se prononce comme dans "le", "de".',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "R" dans "MERCI", sélectionnez la configuration :',
        configurationOptions: ['M', 'J', 'B', 'R'],
        correctConfiguration: 3,
        explanation: 'Pour "R" : Configuration R (pour S, R, Z).\n\nR est une consonne seule, sans voyelle après.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "CI" dans "MERCI", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'R'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 3,
        correctPosition: 2,
        explanation: 'Pour "CI" : Configuration R (pour S, R, Z) + Position 3 (Main à côté de la bouche pour I).\n\nCI se prononce "si" comme dans "merci". La configuration R regroupe les consonnes S, R et Z.',
      },
      {
        type: 'text',
        title: 'Exercice 3 : DEMAIN (moyen)',
        content: 'Un mot avec une voyelle nasale : DEMAIN\n\nDécomposition : DE-MAIN\n\nDE :\n- D → Configuration J (D, P, J)\n- E → Position à l\'écart du visage\n\nMAIN :\n- M → Configuration M\n- AIN → Position sous l\'œil (voyelle nasale IN)',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "DE" dans "DEMAIN", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'R'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 1,
        correctPosition: 1,
        explanation: 'Pour "DE" : Configuration J (pour P, D, J) + Position 2 (Main à l\'écart du visage pour E).\n\nE se prononce comme dans "le", "de".',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "MAIN" dans "DEMAIN", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 0,
        correctPosition: 0,
        explanation: 'Pour "MAIN" : Configuration M + Position 1 (Main sous l\'œil pour IN/AIN).\n\nPiège : Ne pas confondre AIN (pos 1) avec AN (pos 3).',
      },
      {
        type: 'text',
        title: 'Exercice 4 : AUJOURD\'HUI (difficile)',
        imageKey: 'aujourdhui',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Un mot long avec plusieurs syllabes : AUJOURD\'HUI\n\nDécomposition : AU-JOUR-D-HUI\n\nAU :\n- Voyelle O → Position à l\'écart du visage (pas de consonne initiale)\n\nJOUR :\n- J → Configuration J\n- OU → Position au niveau du menton\n- R → Configuration R\n\nD :\n- Consonne D sans position au visage\n\nHUI :\n- OU → Configuration L (L, CH, GN, OU)\n- I → Position à côté de la bouche',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "JOU" dans "AUJOURD\'HUI", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 1,
        correctPosition: 3,
        explanation: 'Pour "JOU" : Configuration J + Position 4 (Main au niveau du menton pour OU).\n\nDans les mots longs, gardez un rythme régulier et ne précipitez pas les transitions.',
      },
      {
        type: 'text',
        title: 'Exercice 5 : PEUT-ÊTRE (difficile)',
        imageKey: 'peutetre',
        imageUrl: 'LOAD_FROM_DB',
        content: 'Un mot avec une liaison délicate : PEUT-ÊTRE\n\nDécomposition : PEU-TÉ-T-R\n\nPEU :\n- P → Configuration J\n- EU → Position sous l\'œil\n\nTÉ :\n- T → Configuration M (M, T, F)\n- É → Position au niveau du menton\n\nT :\n- T → Configuration M\n\nR :\n- R → Configuration R',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "PEUT" dans "PEUT-ÊTRE", quelle configuration pour P et quelle position pour EU ?',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['LOAD_POSITION_1', 'LOAD_POSITION_2', 'LOAD_POSITION_3', 'LOAD_POSITION_4', 'LOAD_POSITION_5'],
        correctConfiguration: 1,
        correctPosition: 0,
        explanation: 'Pour "PEUT" : Configuration J (pour P) + Position 1 (Main sous l\'œil pour EU).\n\nAttention : EU et É sont différents ! EU = position 1, É = position 5.',
      },
      {
        type: 'info',
        title: 'Récapitulatif',
        content: 'Les combinaisons avancées = enchaîner plusieurs syllabes avec précision\n\nMéthode : Découper → Coder → Enchaîner → Vérifier\n\nRègles d\'or : Précision, Fluidité, Synchronisation\n\nPièges à éviter : Confondre les voyelles nasales (AN/ON/IN), négliger les consonnes finales, aller trop vite\n\nPratiquez lentement puis accélérez progressivement',
      },
      {
        type: 'practice',
        title: 'Mission : Entraînement autonome',
        content: 'Votre mission (10 minutes) :\n\nChoisissez 3 mots de votre quotidien (prénom, ville, métier...) et :\n\n1. Décomposez-les en syllabes\n2. Identifiez les configurations et positions\n3. Pratiquez l\'enchaînement lentement\n4. Accélérez progressivement\n\nExemples de mots à essayer :\n- TÉLÉPHONE\n- ORDINATEUR\n- RESTAURANT\n- PHARMACIE\n\nFélicitations ! Vous maîtrisez maintenant les combinaisons avancées en LFPC ! ',
      },
    ],
  },
  '6': {
    title: 'Phrases courantes',
    sections: [
      {
        type: 'text',
        title: 'Construire des phrases complètes',
        content: 'Vous savez maintenant coder des mots complexes. Il est temps de passer aux phrases complètes !\n\nDans cette leçon, vous allez apprendre à enchaîner plusieurs mots pour former des phrases courantes du quotidien.',
      },
      {
        type: 'info',
        title: 'Objectifs de cette leçon',
        content: '✓ Coder des phrases courantes (salutations, questions, réponses)\n✓ Gérer les transitions entre les mots\n✓ Maintenir un rythme naturel\n✓ Synchroniser gestes et parole sur plusieurs mots',
      },
      {
        type: 'text',
        title: 'Phrase 1 : "Bonjour, comment ça va ?"',
        content: 'Commençons par une phrase de salutation classique.\n\nDécomposition :\n- BONJOUR : BON-JOUR > BOn > JOU > R\n- COMMENT : KO-MAN\n- ÇA : SA\n- VA : VA\n\nAstuce : Marquez une micro-pause entre chaque mot, comme à l\'oral.',
        imageKey: 'bonjour_comment_ca_va',
        imageUrl: 'LOAD_FROM_DB',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "KO" dans "COMMENT", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'K'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 3,
        correctPosition: 1,
        explanation: 'Pour "KO" : Configuration K (pour K/V/Z) + Position "Main à l\'écart du visage" (pour O).\n\nAttention : C devant O se prononce K, donc configuration K.',
      },
      {
        type: 'text',
        title: 'Phrase 2 : "Je voudrais un café"',
        content: 'Une phrase utile au quotidien !\n\nDécomposition :\n- JE : JE\n- VOUDRAIS : VOU-D-Ré\n- UN : UN\n- CAFÉ : CA-FÉ\n\nPoint clé : Les liaisons ne se codent pas en LFPC, on suit la prononciation naturelle.',
        imageKey: 'je_voudrais_un_cafe',
        imageUrl: 'LOAD_FROM_DB',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "VOU" dans "VOUDRAIS", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'K', 'L'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 2,
        correctPosition: 3,
        explanation: 'Pour "VOU" : Configuration K (pour V/K/Z) + Position "Main au niveau du menton" (pour OU).\n\nV fait partie du groupe K/V/Z.',
      },
      {
        type: 'text',
        title: 'Phrase 3 : "Quelle heure est-il ?"',
        content: 'Une question fréquente.\n\nDécomposition :\n- QUELLE : Ké-L\n- HEURE : EU-R (H muet)\n- EST : EST\n- IL : IL\n\nRappel : Le H muet ne se code pas, on passe directement à la voyelle.',
        imageKey: 'quelle_heure_est_t_il',
        imageUrl: 'LOAD_FROM_DB',
      },
      {
        type: 'quiz',
        question: 'Dans "QUELLE HEURE", comment code-t-on le H de HEURE ?',
        options: ['On fait un geste spécial pour H', 'On ne code pas le H muet', 'On utilise la configuration G', 'On marque une pause'],
        correctAnswer: 1,
        explanation: 'Le H muet ne se code jamais en LFPC. On passe directement à la voyelle qui suit.',
      },
      {
        type: 'text',
        title: 'Phrase 4 : "Merci beaucoup"',
        content: 'Expression de politesse essentielle.\n\nDécomposition :\n- MERCI : ME-R-CI\n- BEAUCOUP : BO-KOU',
        imageKey: 'merci_beaucoup',
        imageUrl: 'LOAD_FROM_DB',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "BO" dans "BEAUCOUP", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 2,
        correctPosition: 1,
        explanation: 'Pour "BO" : Configuration B + Position "Main à l\'écart du visage" (pour O).\n\nEAU se prononce O, donc une seule voyelle à coder.',
      },
      {
        type: 'text',
        title: 'Phrase 5 : "Je ne comprends pas"',
        content: 'Phrase importante pour la communication.\n\nDécomposition :\n- JE : JE\n- NE : NE\n- COMPRENDS : KON-P-RAN\n- PAS : PA\n\nPoint clé : En LFPC, chaque syllabe doit être codée distinctement. Décomposez bien "COMPRENDS" en trois parties : KON, P, RAN.',
        imageKey: 'je_ne_comprends_pas',
        imageUrl: 'LOAD_FROM_DB',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "KON" dans "COMPRENDS", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'K'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 3,
        correctPosition: 0,
        explanation: 'Pour "KON" : Configuration K (pour K/V/Z) + Position "Main à côté de la bouche" (pour ON).\n\nLe C devant O se prononce K. ON se code à côté de la bouche.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "P" dans "COMPRENDS", sélectionnez la configuration :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        correctConfiguration: 1,
        explanation: 'Pour "P" seul : Configuration J (pour P/T/D).\n\nPour les consonnes seules, seule la configuration de main est nécessaire.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "RAN" dans "COMPRENDS", sélectionnez la configuration et la position :',
        configurationOptions: ['M', 'J', 'B', 'K', 'L', 'R'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 5,
        correctPosition: 0,
        explanation: 'Pour "RAN" : Configuration R (pour S/R) + Position "Main à côté de la bouche" (pour AN).\n\nR fait partie du groupe S/R et AN se code à côté de la bouche.',
      },
      {
        type: 'info',
        title: 'Astuces pour les phrases',
        content: '1. Respirez naturellement entre les mots\n2. Gardez un rythme régulier\n3. Ne précipitez pas les fins de phrase\n4. Synchronisez gestes et parole\n5. Pratiquez d\'abord lentement',
      },
      {
        type: 'practice',
        title: 'Entraînement phrases courantes',
        content: 'Pratiquez ces phrases du quotidien :\n\n• "Bonjour, ça va ?"\n• "Oui, merci et toi ?"\n• "Qu\'est-ce que tu fais ?"\n• "Je vais bien"\n• "À bientôt !"\n\nCommencez lentement, puis accélérez progressivement jusqu\'à atteindre un rythme naturel.\n\nFélicitations ! Vous savez maintenant coder des phrases complètes ! 🎉',
      },
    ],
  },
  '7': {
    title: 'Fluidité et rythme',
    sections: [
      {
        type: 'text',
        title: 'Améliorer votre vitesse d\'exécution',
        content: 'Vous savez coder des phrases complètes. Maintenant, travaillons sur la fluidité et le rythme pour rendre votre LFPC plus naturel et agréable à lire.\n\nDans cette leçon, vous allez apprendre à accélérer sans perdre en précision.',
      },
      {
        type: 'info',
        title: 'Pourquoi la fluidité est importante ?',
        content: 'Un LFPC fluide permet :\n✓ Une lecture plus facile pour l\'interlocuteur\n✓ Une communication plus naturelle\n✓ Moins de fatigue pour le codeur\n✓ Une meilleure synchronisation avec la parole',
      },
      {
        type: 'text',
        title: 'Les 3 piliers de la fluidité',
        content: '1. Précision : Chaque geste doit rester clair\n\n2. Vitesse : Adapter le rythme à la parole naturelle\n\n3. Économie de mouvement : Minimiser les déplacements inutiles',
      },
      {
        type: 'text',
        title: 'Exercice 1 : Mots rapides',
        content: 'Pratiquez ces mots en augmentant progressivement la vitesse :\n\n• PAPA (facile)\n• BONJOUR (moyen)\n• TÉLÉPHONE (difficile)\n• AUJOURD\'HUI (très difficile)\n\nChronométrez-vous : visez 1 seconde par syllabe au début, puis 0.5 seconde.',
      },
      {
        type: 'info',
        title: 'Erreurs fréquentes à éviter',
        content: '❌ Aller trop vite au détriment de la précision\n❌ Négliger les consonnes finales\n❌ Faire des mouvements trop amples\n❌ Perdre la synchronisation avec la parole\n❌ Se crisper (restez détendu !)',
      },
      {
        type: 'multipart_quiz',
        question: 'Dans "APPELLES" (tu t\'appelles), pour coder "PE", sélectionnez :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 1,
        correctPosition: 3,
        explanation: 'Pour "PE" : Configuration J (pour P) + Position "Main au niveau du menton" (pour E).\n\nDans un mot rapide, gardez la même précision qu\'en lent.',
      },
      {
        type: 'text',
        title: 'Technique avancée : L\'anticipation',
        content: 'Pour gagner en fluidité, anticipez la prochaine syllabe pendant que vous codez la syllabe actuelle.\n\nVotre cerveau doit toujours avoir "une syllabe d\'avance".\n\nCela demande de la pratique, mais c\'est la clé d\'un LFPC vraiment fluide.',
      },
      {
        type: 'info',
        title: 'Programme d\'entraînement',
        content: 'N\'hésite pas à t\'entraîner sur les entraînements débutant pour bien mémoriser les différentes positions et configurations !\n\nProgressez à votre rythme, la régularité est plus importante que l\'intensité.',
      },
      {
        type: 'practice',
        title: 'Mission fluidité',
        content: 'Votre mission pour les prochains jours :\n\n1. Choisissez 5 phrases que vous utilisez souvent\n2. Pratiquez-les lentement (1 syllabe/seconde)\n3. Accélérez progressivement\n4. Visez le rythme de parole naturel\n5. Filmez-vous pour vous auto-corriger\n\nObjectif final : Coder à la vitesse de la parole normale (3-4 syllabes/seconde).\n\nFélicitations ! Vous progressez vers un LFPC fluide et naturel ! ⚡',
      },
    ],
  },
  '8': {
    title: 'Conversations complexes',
    sections: [
      {
        type: 'text',
        title: 'Bienvenue au niveau avancé !',
        content: 'Vous maîtrisez maintenant les bases et la fluidité du LFPC. Il est temps de passer aux conversations complexes !\n\nDans cette leçon, vous allez apprendre à gérer des dialogues élaborés avec des structures grammaticales avancées.',
      },
      {
        type: 'info',
        title: 'Ce que vous allez maîtriser',
        content: '✓ Dialogues avec plusieurs interlocuteurs\n✓ Phrases longues et complexes\n✓ Subordonnées et relatives\n✓ Temps composés et concordance\n✓ Nuances et subtilités',
      },
      {
        type: 'text',
        title: 'Dialogue 1 : Conversation téléphonique',
        content: 'Personne A : "Allô, c\'est Marie. Est-ce que je pourrais parler à Monsieur Dupont ?"\n\nPersonne B : "Bonjour Marie, je suis désolé mais il est en réunion. Voulez-vous laisser un message ?"\n\nPoint clé : Gérer les changements d\'interlocuteur et les phrases interrogatives.',
      },
      {
        type: 'quiz',
        question: 'Dans une conversation, comment indiquer qu\'on change d\'interlocuteur ?',
        options: ['On fait une pause plus longue', 'On change de position de base', 'On utilise un geste spécial', 'Le LFPC ne permet pas de l\'indiquer'],
        correctAnswer: 0,
        explanation: 'Une pause naturelle entre les répliques suffit. Le contexte et l\'intonation aident aussi.',
      },
      {
        type: 'text',
        title: 'Structure complexe : Subordonnées relatives',
        content: 'Exemple : "Le livre que j\'ai lu hier était passionnant"\n\nDécomposition :\n- LE LIVRE : LE LI-VRE\n- QUE : QUE\n- J\'AI LU : J\'AI LU\n- HIER : HI-ER\n- ÉTAIT : É-TAIT\n- PASSIONNANT : PAS-SIO-NNANT\n\nAstuce : Gardez le même rythme même dans les phrases longues.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "SIO" dans "PASSIONNANT", sélectionnez :',
        configurationOptions: ['M', 'J', 'K', 'R'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 3,
        correctPosition: 4,
        explanation: 'Pour "SIO" : Configuration R (pour S) + Position "Main sous l\'œil" (pour IO prononcé comme dans "lion").\n\nDans les mots longs, décomposez syllabe par syllabe.',
      },
      {
        type: 'text',
        title: 'Dialogue 2 : Débat d\'idées',
        content: 'A : "Je pense que le changement climatique est le plus grand défi de notre époque"\n\nB : "Certes, mais n\'oublions pas les inégalités sociales qui touchent des millions de personnes"\n\nDifficulté : Vocabulaire abstrait et phrases argumentatives.',
      },
      {
        type: 'text',
        title: 'Temps composés : Passé composé',
        content: 'Exemple : "J\'ai mangé" / "Tu as parlé" / "Il est parti"\n\nStructure : Auxiliaire (AVOIR/ÊTRE) + Participe passé\n\nJ\'AI MANGÉ :\n- J\'AI : J\'AI\n- MANGÉ : MAN-GÉ\n\nLe participe passé se code comme un mot normal.',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "MAN" dans "MANGÉ", sélectionnez :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 0,
        correctPosition: 2,
        explanation: 'Pour "MAN" : Configuration M + Position "Main au niveau du cou" (pour AN).\n\nAN est une voyelle nasale, position "Main au niveau du cou".',
      },
      {
        type: 'text',
        title: 'Dialogue 3 : Récit au passé',
        content: '"Hier, pendant que je me promenais dans le parc, j\'ai rencontré un ancien ami que je n\'avais pas vu depuis des années. Nous avons discuté pendant des heures."\n\nDifficulté : Mélange de temps (imparfait, passé composé, plus-que-parfait).',
      },
      {
        type: 'info',
        title: 'Gérer la complexité',
        content: 'Stratégies pour les phrases complexes :\n\n1. Décomposez mentalement avant de coder\n2. Identifiez les groupes de sens\n3. Respirez aux virgules\n4. Gardez un rythme constant\n5. Ne paniquez pas si vous perdez le fil',
      },
      {
        type: 'text',
        title: 'Vocabulaire abstrait',
        content: 'Exemples de mots abstraits courants :\n\n• PHILOSOPHIE : PHI-LO-SO-PHIE\n• DÉMOCRATIE : DÉ-MO-CRA-TIE\n• PSYCHOLOGIE : PSY-CHO-LO-GIE\n• TECHNOLOGIE : TECH-NO-LO-GIE\n\nAstuce : Les mots longs sont souvent réguliers, décomposez-les calmement.',
      },
      {
        type: 'practice',
        title: 'Entraînement conversations',
        content: 'Exercices pratiques :\n\n1. Débat : Choisissez un sujet et argumentez (pour/contre)\n\n2. Récit : Racontez votre journée d\'hier en détail\n\n3. Interview : Simulez une interview professionnelle\n\n4. Explication : Expliquez un concept complexe\n\nObjectif : Tenir une conversation de 5 minutes en LFPC fluide.\n\nFélicitations ! Vous êtes capable de gérer des conversations complexes ! 🗣️',
      },
    ],
  },
  '9': {
    title: 'Expressions idiomatiques',
    sections: [
      {
        type: 'text',
        title: 'Les expressions françaises en LFPC',
        content: 'Les expressions idiomatiques sont des tournures propres à une langue. En LFPC, elles se codent exactement comme elles se prononcent !\n\nDans cette leçon finale, vous allez apprendre à coder les expressions courantes du français.',
      },
      {
        type: 'info',
        title: 'Pourquoi c\'est important ?',
        content: 'Les expressions idiomatiques :\n✓ Enrichissent la communication\n✓ Permettent de nuancer le propos\n✓ Rendent le discours plus naturel\n✓ Font partie de la culture française',
      },
      {
        type: 'text',
        title: 'Expression 1 : "Avoir le cafard"',
        content: 'Signification : Être triste, déprimé\n\nDécomposition :\n- AVOIR : A-VOIR\n- LE : LE\n- CAFARD : CA-FARD\n\nExemple : "Depuis qu\'il est parti, j\'ai le cafard"',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "FARD" dans "CAFARD", sélectionnez :',
        configurationOptions: ['M', 'J', 'B', 'L'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 0,
        correctPosition: 4,
        explanation: 'Pour "FARD" : Configuration M (pour F) + Position "Main sous l\'œil" (pour AR).\n\nAR se prononce comme dans "bar", "car" avec le son A.',
      },
      {
        type: 'text',
        title: 'Expression 2 : "Casser les pieds"',
        content: 'Signification : Ennuyer, importuner\n\nDécomposition :\n- CASSER : CAS-SER\n- LES : LES\n- PIEDS : PIEDS\n\nExemple : "Tu me casses les pieds avec tes questions !"',
      },
      {
        type: 'text',
        title: 'Expression 3 : "Poser un lapin"',
        content: 'Signification : Ne pas venir à un rendez-vous\n\nDécomposition :\n- POSER : PO-SER\n- UN : UN\n- LAPIN : LA-PIN\n\nExemple : "Il m\'a posé un lapin hier soir"',
      },
      {
        type: 'quiz',
        question: 'Comment code-t-on une expression idiomatique en LFPC ?',
        options: ['On utilise un geste spécial', 'On code chaque mot normalement', 'On fait une pause avant l\'expression', 'On ne peut pas coder les expressions'],
        correctAnswer: 1,
        explanation: 'Les expressions se codent mot par mot, exactement comme elles se prononcent. Le LFPC suit toujours la prononciation.',
      },
      {
        type: 'text',
        title: 'Expression 4 : "Tomber dans les pommes"',
        content: 'Signification : S\'évanouir\n\nDécomposition :\n- TOMBER : TOM-BER\n- DANS : DANS\n- LES : LES\n- POMMES : POM-MES\n\nExemple : "Elle est tombée dans les pommes à cause de la chaleur"',
      },
      {
        type: 'text',
        title: 'Expression 5 : "Avoir un chat dans la gorge"',
        content: 'Signification : Être enroué\n\nDécomposition :\n- AVOIR : A-VOIR\n- UN : UN\n- CHAT : CHAT\n- DANS : DANS\n- LA : LA\n- GORGE : GOR-GE\n\nExemple : "Excuse ma voix, j\'ai un chat dans la gorge"',
      },
      {
        type: 'multipart_quiz',
        question: 'Pour coder "GOR" dans "GORGE", sélectionnez :',
        configurationOptions: ['M', 'J', 'B', 'G'],
        positionOptions: ['Main à côté de la bouche', 'Main à l\'écart du visage', 'Main au niveau du cou', 'Main au niveau du menton', 'Main sous l\'œil'],
        correctConfiguration: 3,
        correctPosition: 1,
        explanation: 'Pour "GOR" : Configuration G (poing fermé pour G) + Position "Main à l\'écart du visage" (pour OR).\n\nG est la seule consonne de son groupe.',
      },
      {
        type: 'text',
        title: 'Expressions avec négation',
        content: 'Expression 6 : "Ne pas avoir froid aux yeux"\nSignification : Être courageux\n\nExpression 7 : "Ne pas être dans son assiette"\nSignification : Ne pas se sentir bien\n\nLa négation se code normalement : NE ... PAS',
      },
      {
        type: 'text',
        title: 'Expressions familières',
        content: 'Expression 8 : "En avoir marre"\nSignification : En avoir assez\n\nExpression 9 : "Avoir la flemme"\nSignification : Ne pas avoir envie\n\nExpression 10 : "C\'est pas la mer à boire"\nSignification : Ce n\'est pas si difficile',
      },
      {
        type: 'info',
        title: 'Liste d\'expressions courantes',
        content: 'À pratiquer :\n\n• "Coûter les yeux de la tête" (très cher)\n• "Avoir d\'autres chats à fouetter" (avoir mieux à faire)\n• "Mettre les pieds dans le plat" (dire une vérité gênante)\n• "Tourner autour du pot" (ne pas aller droit au but)\n• "Prendre ses jambes à son cou" (s\'enfuir rapidement)',
      },
      {
        type: 'text',
        title: 'Expressions régionales',
        content: 'Certaines expressions varient selon les régions :\n\nNord : "Avoir la frite" (être en forme)\nSud : "Faire caguer" (ennuyer)\nBelgique : "Avoir son bic" (être de mauvaise humeur)\nSuisse : "Faire la nique" (se moquer)\n\nLe LFPC s\'adapte à toutes les variantes régionales !',
      },
      {
        type: 'practice',
        title: 'Félicitations ! 🎭',
        content: 'Vous avez terminé toutes les leçons de LFPC !\n\nVous maîtrisez maintenant :\n✓ Les 8 configurations de main\n✓ Les 5 positions autour du visage\n✓ Les mots simples et complexes\n✓ Les phrases et conversations\n✓ La fluidité et le rythme\n✓ Les expressions idiomatiques\n\nMission finale :\nUtilisez le LFPC dans votre quotidien ! Pratiquez avec vos proches, codez vos pensées, regardez des vidéos en LFPC.\n\nLa pratique régulière est la clé de la maîtrise.\n\nBravo pour votre parcours ! Vous êtes maintenant un codeur LFPC accompli ! 🌟',
      },
    ],
  },
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedConfiguration, setSelectedConfiguration] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [lessonWithImages, setLessonWithImages] = useState<{ title: string; sections: LessonSection[] } | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | string | null>(null);

  const lesson = lessonContent[id as string];

  useEffect(() => {
    loadHandSignImages();
  }, [id]);

  const loadHandSignImages = async () => {
    if (!lesson) return;

    console.log('🖼️ Chargement des images...');
    console.log('Leçon ID:', id);

    try {
      // Créer un map des images par clé
      const imageMap: { [key: string]: string } = {};
      
      // Charger les images depuis hand_signs pour les leçons 1 et 2
      const { data: handSigns, error: handSignsError } = await supabase
        .from('hand_signs')
        .select('*')
        .order('configuration_number', { ascending: true });

      console.log('📊 Résultat hand_signs:', { count: handSigns?.length, error: handSignsError });

      if (!handSignsError && handSigns) {
        handSigns.forEach((sign: any) => {
          // Mapper chaque consonne du groupe à l'image_url
          const consonnes: string[] = Array.isArray(sign.consonnes) 
            ? sign.consonnes 
            : sign.consonnes.split(', ').map((c: string) => c.trim());
          consonnes.forEach((consonne: string) => {
            console.log(`  - ${consonne}: ${sign.image_url}`);
            imageMap[consonne] = sign.image_url;
          });
        });
      }

      // Charger les images depuis hand_positions pour la leçon 3
      if (id === '3') {
        const { data: handPositions, error: positionsError } = await supabase
          .from('hand_positions')
          .select('*')
          .order('configuration_number', { ascending: true });

        console.log('📊 Résultat hand_positions:', { count: handPositions?.length, error: positionsError });

        if (!positionsError && handPositions) {
          handPositions.forEach((position: any) => {
            console.log(`  - Position ${position.configuration_number}: ${position.image_url}`);
            console.log(`    Description: ${position.description}`);
            console.log(`    Voyelles: ${position.voyelles}`);
            console.log(`    Exemples: ${position.exemples}`);
            imageMap[position.configuration_number.toString()] = position.image_url;
          });
        }
      }

      console.log('🗺️ Image map créé:', imageMap);

      // Charger les données complètes des positions pour les leçons 3, 4 et 5
      let positionsData: any[] = [];
      if (id === '3' || id === '4' || id === '5') {
        const { data: positions } = await supabase
          .from('hand_positions')
          .select('*')
          .order('configuration_number', { ascending: true });
        positionsData = positions || [];
      }

      // Créer un map des descriptions, voyelles et exemples des positions
      const positionDescriptions: { [key: string]: string } = {};
      const positionExamples: { [key: string]: string } = {};
      const positionVoyelles: { [key: string]: string } = {};
      if ((id === '3' || id === '4' || id === '5') && positionsData.length > 0) {
        positionsData.forEach((pos: any) => {
          positionDescriptions[`LOAD_POSITION_${pos.configuration_number}`] = pos.description;
          positionExamples[`EXAMPLES_POSITION_${pos.configuration_number}`] = `Exemple : ${pos.exemples}`;
          positionVoyelles[`VOYELLES_POSITION_${pos.configuration_number}`] = pos.voyelles;
        });
      }

      // Remplacer les URLs dans les sections
      const updatedSections = lesson.sections.map((section, index) => {
        // Charger les images pour les sections text avec imageKey
        if (section.type === 'text' && section.imageKey && section.imageUrl === 'LOAD_FROM_DB') {
          // Mapper les noms de fichiers corrects (avec majuscules)
          const fileNameMap: { [key: string]: string } = {
            'aujourdhui': 'Aujourd\'hui.png',
            'peutetre': 'peutetre.png'
          };
          const fileName = fileNameMap[section.imageKey] || `${section.imageKey}.png`;
          const { data } = supabase.storage.from('Word').getPublicUrl(fileName);
          const imageUrl = data.publicUrl;
          console.log(`  📄 Section text ${index}: ${section.imageKey} -> ${fileName} -> ${imageUrl}`);
          return {
            ...section,
            imageUrl: imageUrl
          };
        }
        
        if (section.type === 'image' && section.imageKey && section.imageUrl === 'LOAD_FROM_DB') {
          const newUrl = imageMap[section.imageKey];
          console.log(`  Section ${index}: ${section.imageKey} -> ${newUrl || 'NOT FOUND'}`);
          return {
            ...section,
            imageUrl: newUrl || section.imageUrl
          };
        }

        // Charger les images depuis le bucket 'Word' pour la leçon 5
        if (section.type === 'image' && section.imageKey && section.imageKey.startsWith('word/')) {
          const fileName = section.imageKey.replace('word/', '');
          const { data } = supabase.storage.from('Word').getPublicUrl(fileName);
          const imageUrl = data.publicUrl;
          console.log(`  🖼️ Section ${index} (Word bucket): ${section.imageKey} -> ${imageUrl}`);
          console.log(`  📁 Bucket: Word, File: ${fileName}`);
          return {
            ...section,
            imageUrl: imageUrl
          };
        }

        // Charger les données depuis hand_positions pour la leçon 3
        if (section.type === 'image' && section.imageKey && section.imageUrl === 'LOAD_FROM_POSITIONS') {
          const positionNumber = parseInt(section.imageKey);
          const positionData = positionsData.find((p: any) => p.configuration_number === positionNumber);
          
          if (positionData) {
            console.log(`  Position ${positionNumber}:`, positionData);
            return {
              ...section,
              title: `Position ${positionNumber} : ${positionData.description}`,
              imageUrl: positionData.image_url,
              content: `**${positionData.description}**\n\nVoyelles : ${positionData.voyelles}\n\nExemples :\n${positionData.exemples}`
            };
          }
        }
        
        // Charger les images pour les options de quiz
        if (section.type === 'quiz' && section.optionImages) {
          // Pour la leçon 3, utiliser les images des positions
          const optionImageUrls = section.optionImages.map(key => {
            // Si c'est un nombre (position), chercher dans imageMap avec le numéro
            if (id === '3' && !isNaN(parseInt(key))) {
              return imageMap[key] || '';
            }
            // Sinon, utiliser la clé directement (pour les autres leçons)
            return imageMap[key] || '';
          });
          console.log(`  Quiz ${index}: options images ->`, optionImageUrls);
          return {
            ...section,
            optionImageUrls: optionImageUrls
          };
        }

        // Remplacer les options et questions des quiz avec les descriptions des positions pour la leçon 3
        if (section.type === 'quiz' && id === '3') {
          let updatedSection = { ...section };
          
          // Remplacer les options
          if (section.options) {
            const updatedOptions = section.options.map(option => {
              if (option.startsWith('LOAD_POSITION_')) {
                return positionDescriptions[option] || option;
              }
              return option;
            });
            console.log(`  Quiz ${index}: options ->`, updatedOptions);
            updatedSection.options = updatedOptions;
          }
          
          // Remplacer les voyelles et exemples dans la question
          if (section.question) {
            let updatedQuestion = section.question;
            
            // Remplacer les voyelles
            Object.keys(positionVoyelles).forEach(key => {
              if (updatedQuestion.includes(key)) {
                updatedQuestion = updatedQuestion.replace(key, positionVoyelles[key]);
              }
            });
            
            // Remplacer les exemples
            Object.keys(positionExamples).forEach(key => {
              if (updatedQuestion.includes(key)) {
                updatedQuestion = updatedQuestion.replace(key, positionExamples[key]);
              }
            });
            
            console.log(`  Quiz ${index}: question ->`, updatedQuestion);
            updatedSection.question = updatedQuestion;
          }
          
          return updatedSection;
        }

        // Charger les configurations et positions pour les quiz multipart (leçons 4, 5, 6, 7, 8)
        if (section.type === 'multipart_quiz' && (id === '4' || id === '5' || id === '6' || id === '7' || id === '8')) {
          let updatedSection = { ...section };
          
          // Charger les URLs des configurations
          if (section.configurationOptions) {
            const configurationImageUrls = section.configurationOptions.map(key => imageMap[key] || '');
            console.log(`  Multipart Quiz ${index}: configuration images ->`, configurationImageUrls);
            updatedSection.configurationImageUrls = configurationImageUrls;
          }
          
          // Remplacer les placeholders de positions par les descriptions
          if (section.positionOptions) {
            const positionOptionsUpdated = section.positionOptions.map(option => {
              if (option.startsWith('LOAD_POSITION_')) {
                return positionDescriptions[option] || option;
              }
              return option;
            });
            console.log(`  Multipart Quiz ${index}: position options ->`, positionOptionsUpdated);
            updatedSection.positionOptions = positionOptionsUpdated;
          }
          
          return updatedSection;
        }
        
        return section;
      });

      console.log('✅ Images chargées avec succès');
      setLessonWithImages({
        title: lesson.title,
        sections: updatedSections
      });
    } catch (error) {
      console.error('❌ Exception chargement images:', error);
      setLessonWithImages(lesson);
    }
  };

  const displayLesson = lessonWithImages || lesson;

  if (!displayLesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Chargement...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Leçon non trouvée</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const section = displayLesson.sections[currentSection];
  const isLastSection = currentSection === displayLesson.sections.length - 1;
  const progress = ((currentSection + 1) / displayLesson.sections.length) * 100;

  const handleNext = async () => {
    // Scroll en haut de la page
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    
    if (isLastSection) {
      // Calculer le score final et vérifier si la leçon est réussie
      const totalQuestions = displayLesson.sections.filter(s => s.type === 'quiz' || s.type === 'multipart_quiz').length;
      const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 100;
      const isPassed = scorePercentage >= 60; // Minimum 60% pour réussir

      console.log('🎓 Fin de la leçon');
      console.log('Score:', score, '/', totalQuestions, '=', scorePercentage.toFixed(0) + '%');
      console.log('Réussite:', isPassed ? 'OUI ✅' : 'NON ❌');

      // Sauvegarder la progression dans tous les cas (réussite ou échec)
      if (user) {
        console.log('🎓 Sauvegarde de la progression de la leçon...');
        console.log('User ID:', user.id);
        console.log('Lesson ID:', id);
        console.log('Passed:', isPassed);

        try {
          // Vérifier si la leçon a déjà été réussie avant
          const { data: existingProgress } = await supabase
            .from('user_lesson_progress')
            .select('passed')
            .eq('user_id', user.id)
            .eq('lesson_id', id as string)
            .single();

          const wasAlreadyPassed = existingProgress?.passed === true;

          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: user.id,
              lesson_id: id as string,
              completed: true,
              passed: isPassed,
              completed_at: new Date().toISOString(),
              score: score,
            }, {
              onConflict: 'user_id,lesson_id'
            })
            .select();

          console.log('📊 Résultat progression:', { data: progressData, error: progressError, wasAlreadyPassed });

          if (progressError) {
            console.error('❌ Erreur progression:', progressError);
            alert(`Erreur lors de la sauvegarde: ${progressError.message}`);
          } else {
            console.log('✅ Progression sauvegardée avec succès');
          }

          // Attribuer les XP si la leçon est réussie ET que c'est la première fois
          if (isPassed && !wasAlreadyPassed) {
            console.log('🎁 Attribution des XP pour leçon réussie (première fois)...');
            
            // Récupérer les données utilisateur actuelles
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('level, total_points')
              .eq('auth_user_id', user.id)
              .single();

            if (!userError && userData) {
              const currentPoints = userData.total_points || 0;
              const currentLevel = userData.level || 1;
              const xpGained = 100; // 100 XP par leçon réussie (première fois uniquement)
              const newTotalPoints = currentPoints + xpGained;

              // Calculer le nouveau niveau (formule : xp_needed = level^2 * 100)
              let newLevel = currentLevel;
              let xpForNextLevel = Math.pow(newLevel, 2) * 100;
              
              while (newTotalPoints >= xpForNextLevel) {
                newLevel += 1;
                xpForNextLevel = Math.pow(newLevel, 2) * 100;
              }

              console.log('📊 XP:', { currentPoints, xpGained, newTotalPoints, currentLevel, newLevel });

              // Mettre à jour les points et le niveau
              const { error: xpError } = await supabase
                .from('users')
                .update({
                  total_points: newTotalPoints,
                  level: newLevel,
                })
                .eq('auth_user_id', user.id);

              if (xpError) {
                console.error('❌ Erreur mise à jour XP:', xpError);
              } else {
                console.log('✅ XP et niveau mis à jour:', { newTotalPoints, newLevel });
                if (newLevel > currentLevel) {
                  alert(`🎉 Félicitations ! Vous êtes passé au niveau ${newLevel} !`);
                }
              }
            }
          } else if (isPassed && wasAlreadyPassed) {
            console.log('ℹ️ Leçon déjà réussie auparavant, pas d\'XP attribués (anti-farm)');
          }

          // Mettre à jour le streak à chaque fin de leçon
          const today = new Date().toISOString().split('T')[0];
          const { data: userData } = await supabase
            .from('users')
            .select('last_practice_date, current_streak, user_id')
            .eq('auth_user_id', user.id)
            .single();

          const lastActivity = userData?.last_practice_date;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = userData?.current_streak || 0;
          
          // Si c'est déjà aujourd'hui, on garde le streak actuel (pas de changement)
          if (lastActivity === today) {
            newStreak = userData?.current_streak || 0;
          }
          // Si la dernière activité était hier, on incrémente
          else if (lastActivity === yesterdayStr) {
            newStreak += 1;
          } 
          // Si la dernière activité n'était pas hier ni aujourd'hui, le streak est cassé
          else {
            newStreak = 1; // Recommencer à 1
          }

          console.log('📊 Mise à jour streak:', { lastActivity, today, yesterdayStr, currentStreak: userData?.current_streak, newStreak });

          const { error: streakError } = await supabase
            .from('users')
            .update({
              current_streak: newStreak,
              last_practice_date: today,
            })
            .eq('auth_user_id', user.id);

          if (streakError) {
            console.error('❌ Erreur streak:', streakError);
          } else {
            console.log('✅ Streak mis à jour:', newStreak);
          }

        } catch (error) {
          console.error('❌ Exception lors de la sauvegarde:', error);
        }
      }

      router.push('/(tabs)/lessons');
    } else {
      setCurrentSection(currentSection + 1);
      setSelectedAnswer(null);
      setSelectedConfiguration(null);
      setSelectedPosition(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setSelectedAnswer(null);
      setSelectedConfiguration(null);
      setSelectedPosition(null);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === section.correctAnswer && !answeredQuestions.has(currentSection)) {
      setScore(score + 1);
      setAnsweredQuestions(new Set(answeredQuestions).add(currentSection));
    }
  };

  const handleMultipartSubmit = () => {
    const hasPosition = section.positionOptions && section.positionOptions.length > 0;
    
    // Vérifier que les champs requis sont remplis
    if (selectedConfiguration === null) return;
    if (hasPosition && selectedPosition === null) return;
    
    setShowExplanation(true);
    
    // Valider selon le type de quiz (avec ou sans position)
    const isCorrect = hasPosition
      ? (selectedConfiguration === section.correctConfiguration && selectedPosition === section.correctPosition)
      : (selectedConfiguration === section.correctConfiguration);
    
    if (isCorrect && !answeredQuestions.has(currentSection)) {
      setScore(score + 1);
      setAnsweredQuestions(new Set(answeredQuestions).add(currentSection));
    }
  };

  const renderSection = () => {
    switch (section.type) {
      case 'text':
        return (
          <View style={[styles.sectionContainer, styles.textBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            {section.title && <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>}
            <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>
            {section.imageUrl && (
              <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
                <Image 
                  source={{ uri: section.imageUrl }} 
                  style={styles.handImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        );

      case 'info':
        return (
          <View style={[styles.sectionContainer, styles.infoBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={styles.infoIcon}>💡</Text>
            {section.title && <Text style={[styles.infoTitle, { color: colors.text }]}>{section.title}</Text>}
            <Text style={[styles.infoContent, { color: colors.textSecondary }]}>{section.content}</Text>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.quizTitle}>Question</Text>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{section.question}</Text>
            
            <View style={styles.optionsContainer}>
              {section.options?.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  style={[
                    styles.optionButton,
                    section.optionImageUrls ? styles.optionButtonWithImage : null,
                    selectedAnswer === index && styles.optionButtonSelected,
                    showExplanation && index === section.correctAnswer && styles.optionButtonCorrect,
                    showExplanation && selectedAnswer === index && index !== section.correctAnswer && styles.optionButtonWrong,
                    hoveredOption === index && !showExplanation && styles.optionButtonHovered,
                  ]}
                  // @ts-ignore
                  onMouseEnter={() => setHoveredOption(index)}
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  {section.optionImageUrls && section.optionImageUrls[index] ? (
                    <View style={styles.optionImageContainer}>
                      <Image 
                        source={{ uri: section.optionImageUrls[index] }} 
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                      <Text style={[
                        styles.optionImageLabel,
                        selectedAnswer === index && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === index && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {showExplanation && (
              <View style={[
                styles.explanationBox,
                selectedAnswer === section.correctAnswer ? styles.explanationCorrect : styles.explanationWrong
              ]}>
                <Text style={styles.explanationTitle}>
                  {selectedAnswer === section.correctAnswer ? '✓ Correct !' : '✗ Incorrect'}
                </Text>
                <Text style={styles.explanationText}>{section.explanation}</Text>
              </View>
            )}
          </View>
        );

      case 'practice':
        const totalQuestions = displayLesson.sections.filter(s => s.type === 'quiz' || s.type === 'multipart_quiz').length;
        const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 100;
        const isPassed = scorePercentage >= 60;
        
        return (
          <View style={[styles.sectionContainer, styles.practiceBox]}>
            <Text style={styles.practiceIcon}>{isPassed ? '🎯' : '💪'}</Text>
            {section.title && <Text style={styles.practiceTitle}>{section.title}</Text>}
            
            {isPassed ? (
              <>
                <Text style={styles.practiceContent}>{section.content}</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>✅ Score : {score}/{totalQuestions} ({scorePercentage.toFixed(0)}%)</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.practiceContent}>
                  Vous avez obtenu {score}/{totalQuestions} ({scorePercentage.toFixed(0)}%).{'\n\n'}
                  Ne vous découragez pas ! L'apprentissage du LFPC demande de la pratique. Prenez le temps de revoir les configurations et réessayez.{'\n\n'}
                  💡 Astuce : Concentrez-vous sur les différences entre chaque configuration de main.
                </Text>
                <View style={[styles.scoreBox, styles.scoreBoxFailed]}>
                  <Text style={styles.scoreTextFailed}>❌ Score insuffisant (minimum 60% requis)</Text>
                </View>
              </>
            )}
          </View>
        );

      case 'image':
        console.log('🖼️ Rendering image section:', { title: section.title, imageUrl: section.imageUrl, imageKey: section.imageKey, hasContent: !!section.content });
        
        // Déterminer la source de l'image
        let imageSource;
        const isVoyellesAll = section.imageUrl === 'LOCAL_ASSET' && section.imageKey === 'voyelles_all';
        if (isVoyellesAll) {
          imageSource = require('../../../../assets/images/voyelles_all.jpg');
        } else if (section.imageUrl) {
          imageSource = { uri: section.imageUrl };
        }
        
        return (
          <View style={styles.sectionContainer}>
            {section.title && <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>}
            {section.content && <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>}
            {imageSource && (
              <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
                <Image 
                  source={imageSource} 
                  style={isVoyellesAll ? styles.voyellesAllImage : styles.handImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        );

      case 'multipart_quiz':
        const hasPosition = section.positionOptions && section.positionOptions.length > 0;
        const isMultipartCorrect = hasPosition 
          ? (selectedConfiguration === section.correctConfiguration && selectedPosition === section.correctPosition)
          : (selectedConfiguration === section.correctConfiguration);
        const canSubmit = hasPosition 
          ? (selectedConfiguration !== null && selectedPosition !== null)
          : (selectedConfiguration !== null);
        
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.quizTitle}>Question</Text>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{section.question}</Text>
            
            {/* Section Configuration */}
            <Text style={[styles.multipartSectionTitle, { color: colors.text }]}>Choisissez la configuration :</Text>
            <View style={styles.optionsContainer}>
              {section.configurationImageUrls?.map((imageUrl, index) => (
                <Pressable
                  key={`config-${index}`}
                  onPress={() => !showExplanation && setSelectedConfiguration(index)}
                  disabled={showExplanation}
                  style={[
                    styles.optionButton,
                    styles.optionButtonWithImage,
                    selectedConfiguration === index && styles.optionButtonSelected,
                    showExplanation && index === section.correctConfiguration && styles.optionButtonCorrect,
                    showExplanation && selectedConfiguration === index && index !== section.correctConfiguration && styles.optionButtonWrong,
                    hoveredOption === `config-${index}` && !showExplanation && styles.optionButtonHovered,
                  ]}
                  // @ts-ignore
                  onMouseEnter={() => setHoveredOption(`config-${index}`)}
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  <View style={styles.optionImageContainer}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.optionImage}
                      resizeMode="contain"
                    />
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Section Position - uniquement si positionOptions existe */}
            {hasPosition && (
              <>
                <Text style={[styles.multipartSectionTitle, { color: colors.text }]}>Choisissez la position :</Text>
                <View style={styles.optionsContainer}>
                  {section.positionOptions?.map((position, index) => (
                    <Pressable
                      key={`pos-${index}`}
                      onPress={() => !showExplanation && setSelectedPosition(index)}
                      disabled={showExplanation}
                      style={[
                        styles.optionButton,
                        selectedPosition === index && styles.optionButtonSelected,
                        showExplanation && index === section.correctPosition && styles.optionButtonCorrect,
                        showExplanation && selectedPosition === index && index !== section.correctPosition && styles.optionButtonWrong,
                        hoveredOption === `pos-${index}` && !showExplanation && styles.optionButtonHovered,
                      ]}
                      // @ts-ignore
                      onMouseEnter={() => setHoveredOption(`pos-${index}`)}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedPosition === index && styles.optionTextSelected,
                      ]}>
                        {position}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Bouton Valider */}
            {!showExplanation && (
              <Pressable
                onPress={handleMultipartSubmit}
                disabled={!canSubmit}
                style={[
                  styles.submitButton,
                  !canSubmit && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {canSubmit ? 'Valider' : hasPosition ? 'Sélectionnez une configuration et une position' : 'Sélectionnez une configuration'}
                </Text>
              </Pressable>
            )}

            {/* Explication */}
            {showExplanation && (
              <View style={[
                styles.explanationBox,
                isMultipartCorrect ? styles.explanationCorrect : styles.explanationWrong
              ]}>
                <Text style={styles.explanationTitle}>
                  {isMultipartCorrect ? '✓ Correct !' : '✗ Incorrect'}
                </Text>
                <Text style={styles.explanationText}>{section.explanation}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={[styles.lessonTitle, { color: colors.text }]}>{displayLesson.title}</Text>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>{currentSection + 1}/{displayLesson.sections.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderSection()}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handlePrevious}
          disabled={currentSection === 0}
          style={[styles.navButton, styles.navButtonSecondary, { backgroundColor: colors.border }]}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary, { color: colors.text }]}>&larr; Précédent</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={section.type === 'quiz' && !showExplanation}
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            section.type === 'quiz' && !showExplanation && styles.navButtonDisabled
          ]}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {isLastSection ? 'Terminer' : 'Suivant →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748B',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    width: 40,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1400,
    width: '85%',
    alignSelf: 'center',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionContent: {
    fontSize: 20,
    lineHeight: 36,
  },
  textBox: {
    borderRadius: 16,
    padding: 36,
    borderWidth: 2,
  },
  infoBox: {
    borderRadius: 16,
    padding: 36,
    borderWidth: 2,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContent: {
    fontSize: 20,
    lineHeight: 32,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quizQuestion: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    borderWidth: 3,
    borderColor: '#3B82F6',
    minHeight: 90,
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionButtonWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionButtonHovered: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.02 }],
  },
  optionButtonWithImage: {
    padding: 8,
  },
  optionImageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  optionImage: {
    width: 136,
    height: 136,
  },
  optionImageLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  optionText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  explanationCorrect: {
    backgroundColor: '#D1FAE5',
  },
  explanationWrong: {
    backgroundColor: '#FEE2E2',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  practiceBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 36,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  practiceIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  practiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 20,
    textAlign: 'center',
  },
  practiceContent: {
    fontSize: 20,
    color: '#15803D',
    lineHeight: 32,
    textAlign: 'center',
  },
  scoreBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
  },
  scoreBoxFailed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  scoreTextFailed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    borderRadius: 12,
    padding: 12,
  },
  handImage: {
    width: 510,
    height: 510,
  },
  voyellesAllImage: {
    width: 816,
    height: 816,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  navButtonSecondary: {},
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    color: '#FFFFFF',
  },
  navButtonTextSecondary: {
    color: '#475569',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  multipartSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
