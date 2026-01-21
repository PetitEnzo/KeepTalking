/**
 * Détecteur combiné visage + main pour positions LFPC précises
 * Utilise BlazeFace pour le visage et HandPose pour la main
 */

import * as blazeface from '@tensorflow-models/blazeface';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';

/**
 * Calcule la position relative de la main par rapport au visage
 * @param {Array} handLandmarks - 21 landmarks de la main
 * @param {Object} faceBoundingBox - Bounding box du visage {topLeft, bottomRight}
 * @returns {number} Position LFPC (1-5) ou null
 */
export function calculateRelativeHandPosition(handLandmarks, faceBoundingBox) {
  if (!handLandmarks || !faceBoundingBox) {
    return null;
  }

  // Extraire les coordonnées du visage
  const faceTop = faceBoundingBox.topLeft[1];
  const faceBottom = faceBoundingBox.bottomRight[1];
  const faceHeight = faceBottom - faceTop;
  const faceCenter = (faceTop + faceBottom) / 2;

  // Position moyenne de la main (poignet + bout majeur)
  const wrist = handLandmarks[0];
  const middleFingerTip = handLandmarks[12];
  const handY = (wrist.y + middleFingerTip.y) / 2;

  // Calculer la position relative par rapport au visage
  const relativeY = (handY - faceTop) / faceHeight;

  console.log('👤 Visage détecté:', {
    top: faceTop.toFixed(0),
    bottom: faceBottom.toFixed(0),
    height: faceHeight.toFixed(0),
    center: faceCenter.toFixed(0)
  });

  console.log('✋ Main relative au visage:', {
    handY: handY.toFixed(0),
    relativeY: relativeY.toFixed(2),
    position: getPositionFromRelative(relativeY)
  });

  return getPositionFromRelative(relativeY);
}

/**
 * Convertit une position relative en position LFPC (1-5)
 * @param {number} relativeY - Position Y relative (0 = haut du visage, 1 = bas du visage)
 * @returns {number} Position LFPC (1-5)
 */
function getPositionFromRelative(relativeY) {
  // Positions LFPC par rapport au visage:
  // 1 = Sous l'œil (haut du visage, -0.3 à 0.2)
  // 2 = À l'écart (côté du visage, 0.2 à 0.4)
  // 3 = Bouche (milieu du visage, 0.4 à 0.6)
  // 4 = Menton (bas du visage, 0.6 à 0.9)
  // 5 = Cou (sous le visage, 0.9 à 1.3)

  if (relativeY < 0.2) {
    return 1; // Sous l'œil (au-dessus ou haut du visage)
  } else if (relativeY < 0.4) {
    return 2; // À l'écart du visage (zone yeux-nez)
  } else if (relativeY < 0.6) {
    return 3; // Bouche (milieu du visage)
  } else if (relativeY < 0.9) {
    return 4; // Menton (bas du visage)
  } else {
    return 5; // Cou (sous le visage)
  }
}

/**
 * Détecte à la fois le visage et la main dans une vidéo
 * @param {HTMLVideoElement} video - Élément vidéo
 * @param {Object} models - Objets {faceModel, handModel}
 * @returns {Promise<Object>} {face, hand}
 */
export async function detectFaceAndHand(video, models) {
  if (!video || !models || !models.faceModel || !models.handModel) {
    return { face: null, hand: null };
  }

  try {
    // Détecter le visage et la main en parallèle
    const [facePredictions, handPredictions] = await Promise.all([
      models.faceModel.estimateFaces(video, false),
      models.handModel.estimateHands(video)
    ]);

    const face = facePredictions && facePredictions.length > 0 
      ? facePredictions[0] 
      : null;

    const hand = handPredictions && handPredictions.length > 0 
      ? handPredictions[0] 
      : null;

    return { face, hand };
  } catch (error) {
    console.error('Erreur détection visage/main:', error);
    return { face: null, hand: null };
  }
}

/**
 * Charge les modèles BlazeFace et HandPose
 * @returns {Promise<Object>} {faceModel, handModel}
 */
export async function loadModels() {
  console.log('🔄 Chargement des modèles BlazeFace + HandPose...');
  
  try {
    const [faceModel, handModel] = await Promise.all([
      blazeface.load(),
      handpose.load()
    ]);

    console.log('✅ Modèles chargés avec succès!');
    return { faceModel, handModel };
  } catch (error) {
    console.error('❌ Erreur chargement modèles:', error);
    throw error;
  }
}

/**
 * Dessine le bounding box du visage sur un canvas
 * @param {CanvasRenderingContext2D} ctx - Contexte canvas
 * @param {Object} face - Prédiction du visage
 */
export function drawFaceBoundingBox(ctx, face) {
  if (!face || !ctx) return;

  const [x1, y1] = face.topLeft;
  const [x2, y2] = face.bottomRight;
  const width = x2 - x1;
  const height = y2 - y1;

  // Dessiner le rectangle du visage
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x1, y1, width, height);

  // Dessiner les lignes de zones LFPC
  const zones = [
    { y: 0.2, label: '1: Œil' },
    { y: 0.4, label: '2: Écart' },
    { y: 0.6, label: '3: Bouche' },
    { y: 0.9, label: '4: Menton' }
  ];

  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.font = '10px Arial';
  ctx.fillStyle = '#00FF00';

  zones.forEach(zone => {
    const zoneY = y1 + (height * zone.y);
    ctx.beginPath();
    ctx.moveTo(x1, zoneY);
    ctx.lineTo(x2, zoneY);
    ctx.stroke();
    
    // Label (corrigé pour le miroir)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.fillText(zone.label, -(x2 - 5), zoneY - 5);
    ctx.restore();
  });

  ctx.setLineDash([]);
}
