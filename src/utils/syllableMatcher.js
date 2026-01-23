/**
 * Utilitaire pour matcher les landmarks détectés avec une syllabe LFPC cible
 */

/**
 * Calcule la position verticale de la main par rapport au visage
 * @param {Array} landmarks - 21 landmarks de la main
 * @param {Object} faceBoundingBox - (Optionnel) Bounding box du visage {topLeft, bottomRight}
 * @returns {number} Position estimée (1-5) ou null
 */
function estimateHandPosition(landmarks, faceBoundingBox = null) {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  // Utiliser le poignet (landmark 0) pour déterminer la position
  const wrist = landmarks[0];
  const middleFingerTip = landmarks[12];
  const avgY = (wrist.y + middleFingerTip.y) / 2;

  let position;

  // Si on a le visage, calculer la position RELATIVE
  if (faceBoundingBox && faceBoundingBox.topLeft && faceBoundingBox.bottomRight) {
    const faceTop = faceBoundingBox.topLeft[1];
    const faceBottom = faceBoundingBox.bottomRight[1];
    const faceHeight = faceBottom - faceTop;

    // Position relative par rapport au visage (0 = haut du visage, 1 = bas du visage)
    const relativeY = (avgY - faceTop) / faceHeight;

    // Positions LFPC relatives au visage
    if (relativeY < 0.2) {
      position = 1; // Sous l'œil (haut du visage)
    } else if (relativeY < 0.4) {
      position = 2; // À l'écart (zone yeux-nez)
    } else if (relativeY < 0.6) {
      position = 3; // Bouche (milieu du visage)
    } else if (relativeY < 0.9) {
      position = 4; // Menton (bas du visage)
    } else {
      position = 5; // Cou (sous le visage)
    }

    console.log(`👤 Position RELATIVE: avgY=${avgY.toFixed(0)}px, faceTop=${faceTop.toFixed(0)}px, relativeY=${relativeY.toFixed(2)}, position=${position}`);
  } 
  // Sinon, utiliser la position ABSOLUE (fallback)
  else {
    const normalizedY = avgY / 360;

    if (normalizedY < 0.20) {
      position = 1;
    } else if (normalizedY < 0.35) {
      position = 2;
    } else if (normalizedY < 0.50) {
      position = 3;
    } else if (normalizedY < 0.65) {
      position = 4;
    } else {
      position = 5;
    }

    console.log(`📏 Position ABSOLUE: avgY=${avgY.toFixed(0)}px, normalized=${normalizedY.toFixed(2)}, position=${position}`);
  }

  return position;
}

/**
 * Détecte si la main est gauche ou droite et si elle est dans le bon sens
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {Object} { handedness: 'left'|'right', palmFacingCamera: boolean, confidence: number }
 */
function detectHandOrientation(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return { handedness: 'unknown', palmFacingCamera: false, confidence: 0 };
  }

  // Landmarks clés
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  const indexMCP = landmarks[5];
  const indexTip = landmarks[8];
  const pinkyMCP = landmarks[17];

  // 1. Déterminer main gauche/droite par position du pouce
  // Si le pouce est à DROITE de l'index (x plus grand), c'est une main DROITE (paume vers caméra)
  // Si le pouce est à GAUCHE de l'index (x plus petit), c'est une main GAUCHE (paume vers caméra)
  const thumbX = thumbMCP.x;
  const indexX = indexMCP.x;
  const xDifference = thumbX - indexX;

  // Main droite: pouce à droite de l'index (x plus grand)
  // Main gauche: pouce à gauche de l'index (x plus petit)
  const isRightHand = xDifference > 0;
  const handedness = isRightHand ? 'right' : 'left';
  
  // Position du pouce par rapport à l'index
  const thumbPosition = xDifference > 0 ? 'DROITE' : 'GAUCHE';

  // 2. Vérifier que la paume est vers la caméra
  // Si paume vers caméra: pouce et auriculaire ont des X différents (main ouverte latéralement)
  // Si dos de main vers caméra: pouce et auriculaire ont des X proches (main fermée visuellement)
  const thumbToIndexDistance = Math.abs(xDifference);
  const handWidth = Math.abs(pinkyMCP.x - indexMCP.x);
  
  // Ratio: si le pouce est bien écarté latéralement, la paume est vers nous
  const thumbSpreadRatio = thumbToIndexDistance / (handWidth + 0.001);
  const palmFacingCamera = thumbSpreadRatio > 0.15; // Seuil: pouce doit être écarté d'au moins 15% de la largeur de la main

  const confidence = Math.min(thumbSpreadRatio * 500, 100);

  // Logs détaillés
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🖐️  DÉTECTION MAIN`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`👉 Main détectée: ${handedness.toUpperCase()}`);
  console.log(`👍 Position pouce: ${thumbPosition} de l'index`);
  console.log(`${palmFacingCamera ? '✅' : '❌'} Paume vers caméra: ${palmFacingCamera ? 'OUI' : 'NON'}`);
  console.log(`📊 Ratio écartement: ${thumbSpreadRatio.toFixed(3)} (seuil: 0.15)`);
  console.log(`📈 Confiance orientation: ${confidence.toFixed(0)}%`);
  
  if (palmFacingCamera) {
    console.log(`✅ VALIDATION: Main ${handedness} avec pouce à ${thumbPosition} = Paume vers vous ✓`);
  } else {
    console.log(`❌ REJET: Pouce pas assez écarté = Dos de main vers caméra ✗`);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return { handedness, palmFacingCamera, confidence, thumbPosition };
}

/**
 * Estime la configuration de main basée sur les doigts levés et leur position
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {Object} { config: string, confidence: number, handedness: string, palmFacingCamera: boolean }
 */
function estimateHandConfiguration(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  // Détecter l'orientation de la main (gauche/droite et paume vers caméra)
  const orientation = detectHandOrientation(landmarks);

  // Analyser l'état de chaque doigt
  const fingerStates = analyzeFingerStates(landmarks);
  const fingersExtended = fingerStates.filter(f => f.extended).length;
  
  console.log('🖐️ Analyse doigts:', {
    extended: fingersExtended,
    thumb: fingerStates[0].extended ? '👍' : '👎',
    index: fingerStates[1].extended ? '☝️' : '👎',
    middle: fingerStates[2].extended ? '🖕' : '👎',
    ring: fingerStates[3].extended ? '💍' : '👎',
    pinky: fingerStates[4].extended ? '🤙' : '👎'
  });
  
  console.log('📏 Ratios d\'extension:', {
    thumb: fingerStates[0].extensionRatio,
    index: fingerStates[1].extensionRatio,
    middle: fingerStates[2].extensionRatio,
    ring: fingerStates[3].extensionRatio,
    pinky: fingerStates[4].extensionRatio
  });

  // DÉTECTION PRÉCISE basée sur les patterns LFPC spécifiques
  // Analyser QUELS doigts sont levés, pas seulement COMBIEN
  const [thumb, index, middle, ring, pinky] = fingerStates.map(f => f.extended);
  
  let config = null;
  let confidence = 100; // Score de confiance de la détection

  // Configuration M (5 doigts) - Main ouverte, tous les doigts levés
  if (fingersExtended === 5) {
    config = 'M';
    confidence = 100;
  }
  
  // Configuration B (4 doigts) - Tous sauf le pouce
  else if (fingersExtended === 4) {
    if (!thumb && index && middle && ring && pinky) {
      config = 'B';
      confidence = 100;
    } else if (!thumb) {
      config = 'B';
      confidence = 85; // Moins sûr si ce n'est pas exactement les 4 bons doigts
    } else {
      // 4 doigts mais avec le pouce = probablement M mal détecté
      config = 'M';
      confidence = 70;
    }
  }
  
  // Configuration L (3 doigts) - Pouce + Index + Auriculaire (signe "I love you")
  // Configuration R (3 doigts) - Index + Majeur + Annulaire
  else if (fingersExtended === 3) {
    if (thumb && index && !middle && !ring && pinky) {
      config = 'L';
      confidence = 100; // Pattern exact L
    } else if (!thumb && index && middle && ring && !pinky) {
      config = 'R';
      confidence = 100; // Pattern exact R (index + majeur + annulaire)
    } else if (thumb && index && pinky) {
      config = 'L';
      confidence = 90; // Pattern proche L
    } else if (index && middle && ring) {
      config = 'R';
      confidence = 90; // Pattern proche R
    } else {
      // 3 doigts mais pattern incertain - favoriser R si pas de pouce
      if (!thumb) {
        config = 'R';
        confidence = 70;
      } else {
        config = 'L';
        confidence = 70;
      }
    }
  }
  
  // Configuration K/V (2 doigts) - Index + Majeur
  // Différencier K (doigts collés) et V (doigts écartés)
  else if (fingersExtended === 2) {
    if (!thumb && index && middle && !ring && !pinky) {
      // Vérifier l'écartement entre index et majeur pour différencier K et V
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const indexMCP = landmarks[5];
      const pinkyMCP = landmarks[17];
      
      // Calculer l'écartement entre les bouts des doigts
      const fingerSpacing = Math.sqrt(
        Math.pow(indexTip.x - middleTip.x, 2) + 
        Math.pow(indexTip.y - middleTip.y, 2)
      );
      
      // Normaliser par rapport à la largeur de la main (distance index-auriculaire)
      const handWidth = Math.sqrt(
        Math.pow(indexMCP.x - pinkyMCP.x, 2) + 
        Math.pow(indexMCP.y - pinkyMCP.y, 2)
      );
      
      const spacingRatio = fingerSpacing / (handWidth + 0.001);
      
      // Si le ratio est > 0.5, les doigts sont écartés (V)
      // Sinon ils sont collés (K)
      if (spacingRatio > 0.5) {
        config = 'ING'; // Configuration V pour ING/LLE
        confidence = 100;
        console.log(`✌️ Doigts écartés détectés (ratio: ${spacingRatio.toFixed(3)}, spacing: ${fingerSpacing.toFixed(1)}px, handWidth: ${handWidth.toFixed(1)}px) → Configuration V/ING`);
      } else {
        config = 'K'; // Configuration K pour K/V/Z
        confidence = 100;
        console.log(`🤞 Doigts collés détectés (ratio: ${spacingRatio.toFixed(3)}, spacing: ${fingerSpacing.toFixed(1)}px, handWidth: ${handWidth.toFixed(1)}px) → Configuration K`);
      }
    } else if (index && middle) {
      // Pattern proche - vérifier l'écartement
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const indexMCP = landmarks[5];
      const pinkyMCP = landmarks[17];
      
      const fingerSpacing = Math.sqrt(
        Math.pow(indexTip.x - middleTip.x, 2) + 
        Math.pow(indexTip.y - middleTip.y, 2)
      );
      
      const handWidth = Math.sqrt(
        Math.pow(indexMCP.x - pinkyMCP.x, 2) + 
        Math.pow(indexMCP.y - pinkyMCP.y, 2)
      );
      
      const spacingRatio = fingerSpacing / (handWidth + 0.001);
      
      if (spacingRatio > 0.5) {
        config = 'ING';
        confidence = 90;
      } else {
        config = 'K';
        confidence = 90;
      }
    } else if (thumb && index) {
      // Pouce + Index = pourrait être L mal détecté
      config = 'L';
      confidence = 60;
    } else {
      config = 'K';
      confidence = 70;
    }
  }
  
  // Configuration J (1 doigt) - Index pointé
  else if (fingersExtended === 1) {
    if (!thumb && index && !middle && !ring && !pinky) {
      config = 'J';
      confidence = 100; // Index seul = parfait
    } else if (index) {
      config = 'J';
      confidence = 95;
    } else if (thumb) {
      // Pouce seul = peut être J ou autre
      config = 'J';
      confidence = 70;
    } else {
      config = 'J';
      confidence = 60;
    }
  }
  
  // Configuration G (0 doigts) - Poing fermé
  else if (fingersExtended === 0) {
    const allFolded = fingerStates.every(f => !f.extended);
    if (allFolded) {
      config = 'G'; // Poing fermé = G
      confidence = 100;
    } else {
      config = 'G';
      confidence = 80;
    }
  }
  
  // Cas ambigus ou incertains
  else {
    // Essayer de deviner la configuration la plus probable
    if (fingersExtended >= 4) {
      config = 'M';
      confidence = 50;
    } else if (fingersExtended === 3) {
      config = 'R'; // Par défaut 3 doigts = R
      confidence = 50;
    } else if (fingersExtended === 2) {
      config = 'K';
      confidence = 40;
    } else {
      config = 'J';
      confidence = 30;
    }
  }

  // Log détaillé avec pattern de doigts
  const fingerPattern = [
    thumb ? 'T' : '-',
    index ? 'I' : '-',
    middle ? 'M' : '-',
    ring ? 'R' : '-',
    pinky ? 'P' : '-'
  ].join('');

  // Réduire la confiance si la paume n'est pas vers la caméra
  let finalConfidence = confidence;
  if (!orientation.palmFacingCamera) {
    finalConfidence = Math.min(confidence * 0.4, 35); // Max 35% si paume vers extérieur
    console.log(`⚠️ Paume vers extérieur détectée - Confiance réduite: ${confidence}% → ${finalConfidence.toFixed(0)}%`);
  }

  console.log(`✋ Configuration: ${config} (confiance: ${finalConfidence.toFixed(0)}%) | Pattern: ${fingerPattern} | Total: ${fingersExtended} doigts`);
  
  return { 
    config, 
    confidence: finalConfidence, 
    fingerPattern,
    handedness: orientation.handedness,
    palmFacingCamera: orientation.palmFacingCamera
  };
}

/**
 * Analyse l'état de chaque doigt (levé ou replié)
 * INVARIANT À L'ORIENTATION - fonctionne quelle que soit la rotation de la main
 * @param {Array} landmarks - 21 landmarks de la main
 * @returns {Array} État de chaque doigt
 */
function analyzeFingerStates(landmarks) {
  const fingers = [
    { name: 'thumb', tip: 4, pip: 3, mcp: 2 },
    { name: 'index', tip: 8, pip: 6, mcp: 5 },
    { name: 'middle', tip: 12, pip: 10, mcp: 9 },
    { name: 'ring', tip: 16, pip: 14, mcp: 13 },
    { name: 'pinky', tip: 20, pip: 18, mcp: 17 }
  ];

  const wrist = landmarks[0];

  return fingers.map((finger, index) => {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];
    const mcp = landmarks[finger.mcp];

    // Distance 3D du bout du doigt au poignet
    const tipToWrist = Math.sqrt(
      Math.pow(tip.x - wrist.x, 2) + 
      Math.pow(tip.y - wrist.y, 2) +
      Math.pow((tip.z || 0) - (wrist.z || 0), 2)
    );

    // Distance 3D de l'articulation PIP au poignet
    const pipToWrist = Math.sqrt(
      Math.pow(pip.x - wrist.x, 2) + 
      Math.pow(pip.y - wrist.y, 2) +
      Math.pow((pip.z || 0) - (wrist.z || 0), 2)
    );

    // Distance 3D de l'articulation MCP au poignet
    const mcpToWrist = Math.sqrt(
      Math.pow(mcp.x - wrist.x, 2) + 
      Math.pow(mcp.y - wrist.y, 2) +
      Math.pow((mcp.z || 0) - (wrist.z || 0), 2)
    );

    // Distance entre tip et pip (longueur du segment)
    const tipToPip = Math.sqrt(
      Math.pow(tip.x - pip.x, 2) + 
      Math.pow(tip.y - pip.y, 2) +
      Math.pow((tip.z || 0) - (pip.z || 0), 2)
    );

    // LOGIQUE INVARIANTE À L'ORIENTATION:
    // Un doigt est levé si le bout est significativement plus loin du poignet que le PIP
    // Utiliser un ratio plutôt que des coordonnées absolues
    const extensionRatio = tipToWrist / (pipToWrist + 0.001); // +0.001 pour éviter division par 0
    
    // Seuil adapté par doigt (PLUS STRICT pour R/S - poing fermé)
    let extended = false;
    
    if (index === 0) {
      // Pouce: seuil plus strict pour mieux détecter poing fermé
      extended = extensionRatio > 1.20;
    } else {
      // Autres doigts: seuil plus strict pour mieux détecter poing fermé
      extended = extensionRatio > 1.15;
    }

    return {
      name: finger.name,
      extended,
      tipToWrist,
      pipToWrist,
      mcpToWrist,
      extensionRatio: extensionRatio.toFixed(2)
    };
  });
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
 * @param {Object} faceBoundingBox - (Optionnel) Bounding box du visage pour position relative
 * @returns {Object} Résultat du matching
 */
export function matchSyllable(landmarks, targetSyllable, faceBoundingBox = null) {
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
  const detectedPosition = estimateHandPosition(normalizedLandmarks, faceBoundingBox);
  const configResult = estimateHandConfiguration(normalizedLandmarks);
  const detectedConfig = configResult ? configResult.config : null;
  const detectionConfidence = configResult ? configResult.confidence : 0;

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
    // Moyenne pondérée avec légère pénalité si config < 60%
    if (configConfidence < 60) {
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
  
  // RÈGLE STRICTE: Si une configuration est requise, elle doit être au moins à 60%
  if (targetSyllable.hand_sign_key && configConfidence < 60) {
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
