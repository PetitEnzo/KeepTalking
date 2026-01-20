/**
 * Utilitaire pour matcher les landmarks détectés avec une syllabe LFPC cible
 */

/**
 * Calcule la position verticale de la main par rapport au visage
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {number} Position estimée (1-5) ou null
 */
function estimateHandPosition(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  // Utiliser le poignet (landmark 0) pour déterminer la position
  const wrist = landmarks[0];
  const middleFingerTip = landmarks[12];

  // Position verticale moyenne de la main (normaliser par la hauteur du canvas)
  const avgY = (wrist.y + middleFingerTip.y) / 2;
  
  // Normaliser la position Y (les coordonnées sont en pixels, on divise par 360 pour avoir 0-1)
  const normalizedY = avgY / 360;

  // Mapping basé sur la position Y normalisée (0 = haut, 1 = bas)
  // Ajusté pour mieux correspondre aux positions LFPC réelles
  let position;
  if (normalizedY < 0.20) {
    position = 1; // Main très haute (sous l'œil)
  } else if (normalizedY < 0.35) {
    position = 2; // Main haute (à l'écart du visage)
  } else if (normalizedY < 0.50) {
    position = 3; // Main moyenne (à côté de la bouche)
  } else if (normalizedY < 0.65) {
    position = 4; // Main basse (au niveau du menton)
  } else {
    position = 5; // Main très basse (au niveau du cou)
  }

  // Log pour débogage (à retirer en production)
  console.log(`Position main: avgY=${avgY.toFixed(0)}px, normalized=${normalizedY.toFixed(2)}, position=${position}`);

  return position;
}

/**
 * Estime la configuration de main basée sur les doigts levés
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {string} Clé de configuration estimée ou null
 */
function estimateHandConfiguration(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  // Compter les doigts levés (approximation simple)
  const fingersExtended = countExtendedFingers(landmarks);

  // Mapping simple basé sur le nombre de doigts levés
  // Cette logique peut être améliorée avec des templates plus précis
  const configMapping = {
    0: 'G', // Poing fermé
    1: 'J', // Un doigt (index)
    2: 'K', // Deux doigts
    3: 'L', // Trois doigts
    4: 'B', // Quatre doigts
    5: 'M', // Main ouverte (tous les doigts)
  };

  return configMapping[fingersExtended] || null;
}

/**
 * Compte le nombre de doigts levés
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {number} Nombre de doigts levés (0-5)
 */
function countExtendedFingers(landmarks) {
  let count = 0;

  // Indices des bouts de doigts et articulations
  const fingers = [
    { tip: 4, pip: 3 },   // Pouce
    { tip: 8, pip: 6 },   // Index
    { tip: 12, pip: 10 }, // Majeur
    { tip: 16, pip: 14 }, // Annulaire
    { tip: 20, pip: 18 }, // Auriculaire
  ];

  const wrist = landmarks[0];

  fingers.forEach(finger => {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];

    // Un doigt est considéré levé si le bout est plus haut que l'articulation
    // et plus éloigné du poignet
    const tipDistance = Math.sqrt(
      Math.pow(tip.x - wrist.x, 2) + 
      Math.pow(tip.y - wrist.y, 2)
    );
    const pipDistance = Math.sqrt(
      Math.pow(pip.x - wrist.x, 2) + 
      Math.pow(pip.y - wrist.y, 2)
    );

    if (tipDistance > pipDistance && tip.y < pip.y) {
      count++;
    }
  });

  return count;
}

/**
 * Calcule un score de confiance pour une position de main
 * @param {number} detectedPosition - Position détectée (1-5)
 * @param {number} targetPosition - Position cible (1-5)
 * @returns {number} Score de confiance (0-100)
 */
function calculatePositionConfidence(detectedPosition, targetPosition) {
  if (!detectedPosition || !targetPosition) {
    return 0;
  }

  // Confiance basée sur la proximité (ENCORE PLUS PERMISSIF)
  const difference = Math.abs(detectedPosition - targetPosition);
  
  if (difference === 0) {
    return 100; // Position exacte
  } else if (difference === 1) {
    return 95; // Position adjacente (très très permissif)
  } else if (difference === 2) {
    return 85; // Position proche (très permissif)
  } else {
    return 65; // Position éloignée (permissif)
  }
}

/**
 * Calcule un score de confiance pour une configuration de main
 * @param {string} detectedConfig - Configuration détectée
 * @param {string} targetConfig - Configuration cible
 * @returns {number} Score de confiance (0-100)
 */
function calculateConfigurationConfidence(detectedConfig, targetConfig) {
  if (!detectedConfig || !targetConfig) {
    return 0;
  }

  // Configurations similaires (même groupe)
  const configGroups = {
    'M': ['M', 'T', 'F'],
    'J': ['J', 'P', 'D'],
    'B': ['B', 'N'],
    'L': ['L', 'CH', 'GN'],
    'K': ['K', 'Z', 'V', 'C', 'Q'],
    'R': ['R', 'S'],
    'G': ['G'],
  };

  // Trouver le groupe de la config cible
  let targetGroup = null;
  for (const [key, group] of Object.entries(configGroups)) {
    if (group.includes(targetConfig)) {
      targetGroup = group;
      break;
    }
  }

  if (detectedConfig === targetConfig) {
    return 100; // Configuration exacte
  } else if (targetGroup && targetGroup.includes(detectedConfig)) {
    return 80; // Configuration du même groupe (permissif mais pas trop)
  } else {
    return 0; // Configuration différente = ÉCHEC (pas de validation fantôme)
  }
}

/**
 * Fonction principale de matching d'une syllabe
 * @param {Array} landmarks - 21 landmarks détectés
 * @param {Object} targetSyllable - Syllabe cible
 * @returns {Object} Résultat du matching
 */
export function matchSyllable(landmarks, targetSyllable) {
  // Si pas de landmarks, retourner 0% de confiance
  if (!landmarks || landmarks.length !== 21) {
    return {
      isValid: false,
      confidence: 0,
      feedback: 'Aucune main détectée',
      details: null,
    };
  }

  if (!targetSyllable) {
    return {
      isValid: false,
      confidence: 0,
      feedback: 'Syllabe cible non définie',
      details: null,
    };
  }

  // Convertir les landmarks du format TensorFlow.js [x, y, z] vers {x, y, z}
  const normalizedLandmarks = landmarks.map(landmark => {
    if (Array.isArray(landmark)) {
      return { x: landmark[0], y: landmark[1], z: landmark[2] || 0 };
    }
    return landmark;
  });

  // Détecter la position et la configuration
  const detectedPosition = estimateHandPosition(normalizedLandmarks);
  const detectedConfig = estimateHandConfiguration(normalizedLandmarks);

  let positionConfidence = 0;
  let configConfidence = 0;
  let feedback = '';

  // Vérifier la position (si la syllabe a une voyelle)
  if (targetSyllable.hand_position_config) {
    positionConfidence = calculatePositionConfidence(
      detectedPosition,
      targetSyllable.hand_position_config
    );

    if (positionConfidence < 40) {
      const positionNames = {
        1: "sous l'œil",
        2: "à l'écart du visage",
        3: "à côté de la bouche",
        4: "au niveau du menton",
        5: "au niveau du cou",
      };
      feedback = `Positionnez votre main ${positionNames[targetSyllable.hand_position_config]}`;
    }
  } else {
    // Pas de position requise (consonne seule)
    positionConfidence = 100;
  }

  // Vérifier la configuration (si la syllabe a une consonne)
  if (targetSyllable.hand_sign_key) {
    configConfidence = calculateConfigurationConfidence(
      detectedConfig,
      targetSyllable.hand_sign_key
    );

    if (configConfidence < 40 && positionConfidence >= 40) {
      feedback = `Formez la configuration ${targetSyllable.hand_sign_key}`;
    }
  } else {
    // Pas de configuration requise (voyelle seule) - ignorer complètement la config
    configConfidence = 100;
  }

  // Calculer la confiance globale
  let totalConfidence = 0;
  if (targetSyllable.hand_position_config && targetSyllable.hand_sign_key) {
    // Syllabe complète (consonne + voyelle)
    // La configuration doit être au moins à 70% pour valider (éviter les fantômes)
    if (configConfidence < 70) {
      totalConfidence = Math.min(configConfidence, positionConfidence); // Prendre le plus faible
    } else {
      totalConfidence = (positionConfidence + configConfidence) / 2;
    }
  } else if (targetSyllable.hand_position_config && !targetSyllable.hand_sign_key) {
    // Voyelle seule - UNIQUEMENT la position compte, peu importe la configuration des doigts
    totalConfidence = positionConfidence;
  } else if (targetSyllable.hand_sign_key && !targetSyllable.hand_position_config) {
    // Consonne seule - LA CONFIGURATION DOIT ÊTRE CORRECTE
    totalConfidence = configConfidence;
  } else {
    // Cas par défaut (ne devrait pas arriver)
    totalConfidence = 0;
  }

  // Validation avec vérification stricte de la configuration
  let isValid = totalConfidence >= 60;
  
  // RÈGLE STRICTE: Si une configuration est requise, elle doit être au moins à 70%
  if (targetSyllable.hand_sign_key && configConfidence < 70) {
    isValid = false;
    feedback = `Formez la configuration ${targetSyllable.hand_sign_key} correctement`;
  } else if (isValid) {
    feedback = '✅ Syllabe validée !';
  } else if (totalConfidence >= 40) {
    feedback = 'Presque ! Maintenez la position...';
  }

  return {
    isValid,
    confidence: Math.round(totalConfidence),
    feedback,
    details: {
      detectedPosition,
      detectedConfig,
      positionConfidence: Math.round(positionConfidence),
      configConfidence: Math.round(configConfidence),
    },
  };
}

/**
 * Vérifie si la validation est stable (confiance élevée pendant une durée)
 * @param {Array} confidenceHistory - Historique des scores de confiance
 * @param {number} threshold - Seuil de confiance (défaut: 80)
 * @param {number} duration - Durée requise en nombre de frames (défaut: 30 = ~1 sec à 30fps)
 * @returns {boolean} True si la validation est stable
 */
export function isValidationStable(confidenceHistory, threshold = 80, duration = 30) {
  if (!confidenceHistory || confidenceHistory.length < duration) {
    return false;
  }

  // Vérifier les N dernières frames
  const recentHistory = confidenceHistory.slice(-duration);
  
  // Toutes les frames doivent être au-dessus du seuil
  return recentHistory.every(conf => conf >= threshold);
}
