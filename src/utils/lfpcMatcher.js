/**
 * Utilitaire pour comparer les landmarks détectés avec les configurations LFPC
 */

/**
 * Calcule la distance euclidienne entre deux points 3D
 */
function euclideanDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = point1.z - point2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calcule la distance moyenne entre deux ensembles de landmarks
 * @param {Array} landmarks1 - Premier ensemble de landmarks (21 points)
 * @param {Array} landmarks2 - Deuxième ensemble de landmarks (21 points)
 * @returns {number} Distance moyenne
 */
function calculateAverageDistance(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2 || landmarks1.length !== landmarks2.length) {
    return Infinity;
  }

  let totalDistance = 0;
  const numPoints = landmarks1.length;

  for (let i = 0; i < numPoints; i++) {
    totalDistance += euclideanDistance(landmarks1[i], landmarks2[i]);
  }

  return totalDistance / numPoints;
}

/**
 * Calcule la distance pour les points clés spécifiques (poignet, bout des doigts, etc.)
 * Ces points sont plus importants pour identifier la configuration LFPC
 */
function calculateKeyPointsDistance(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) {
    return Infinity;
  }

  // Points clés pour LFPC (indices MediaPipe)
  const keyPointIndices = [
    0,  // Poignet
    4,  // Pouce
    8,  // Index
    12, // Majeur
    16, // Annulaire
    20  // Auriculaire
  ];

  let totalDistance = 0;
  for (const index of keyPointIndices) {
    if (landmarks1[index] && landmarks2[index]) {
      totalDistance += euclideanDistance(landmarks1[index], landmarks2[index]);
    }
  }

  return totalDistance / keyPointIndices.length;
}

/**
 * Normalise les landmarks par rapport au poignet (point 0)
 * Cela rend la comparaison indépendante de la position de la main
 */
function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return [];
  }

  const wrist = landmarks[0];
  return landmarks.map(point => ({
    x: point.x - wrist.x,
    y: point.y - wrist.y,
    z: point.z - wrist.z,
  }));
}

/**
 * Compare les landmarks détectés avec les configurations LFPC
 * @param {Array} detectedLandmarks - Landmarks détectés par MediaPipe (21 points)
 * @param {Array} lfpcConfigs - Liste des configurations LFPC de référence
 * @returns {Object|null} Configuration la plus proche ou null
 */
export function compareWithLFPCConfig(detectedLandmarks, lfpcConfigs) {
  if (!detectedLandmarks || detectedLandmarks.length !== 21) {
    console.warn('Landmarks invalides:', detectedLandmarks);
    return null;
  }

  if (!lfpcConfigs || lfpcConfigs.length === 0) {
    console.warn('Aucune configuration LFPC fournie');
    return null;
  }

  // Normaliser les landmarks détectés
  const normalizedDetected = normalizeLandmarks(detectedLandmarks);

  let bestMatch = null;
  let bestDistance = Infinity;
  let bestConfidence = 0;

  for (const config of lfpcConfigs) {
    if (!config.reference_landmarks || config.reference_landmarks.length !== 21) {
      continue;
    }

    // Normaliser les landmarks de référence
    const normalizedReference = normalizeLandmarks(config.reference_landmarks);

    // Calculer la distance (on utilise les points clés pour plus de précision)
    const distance = calculateKeyPointsDistance(normalizedDetected, normalizedReference);

    // Calculer un score de confiance (0-100%)
    // Plus la distance est faible, plus la confiance est élevée
    const confidence = Math.max(0, Math.min(100, (1 - distance * 10) * 100));

    if (distance < bestDistance) {
      bestDistance = distance;
      bestConfidence = confidence;
      bestMatch = {
        ...config,
        distance,
        confidence: Math.round(bestConfidence),
      };
    }
  }

  // Retourner le meilleur match seulement si la confiance est > 30%
  if (bestMatch && bestMatch.confidence > 30) {
    return bestMatch;
  }

  return null;
}

/**
 * Exemple de configurations LFPC de référence
 * Ces données devraient idéalement venir de Supabase
 */
export const SAMPLE_LFPC_CONFIGS = [
  {
    id: 1,
    description: "Main sous l'œil",
    voyelles: ["in", "eu", "un"],
    position_number: 1,
    reference_landmarks: null, // À remplir avec des vraies données
  },
  {
    id: 2,
    description: "Main à l'écart du visage",
    voyelles: ["a", "o", "e"],
    position_number: 2,
    reference_landmarks: null,
  },
  {
    id: 3,
    description: "Main à côté de la bouche",
    voyelles: ["i", "on", "an", "en"],
    position_number: 3,
    reference_landmarks: null,
  },
  {
    id: 4,
    description: "Main au niveau du menton",
    voyelles: ["è", "ê", "ou"],
    position_number: 4,
    reference_landmarks: null,
  },
  {
    id: 5,
    description: "Main au niveau du cou",
    voyelles: ["u", "é", "ù"],
    position_number: 5,
    reference_landmarks: null,
  },
];
