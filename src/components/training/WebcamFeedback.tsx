import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// Déclarer les types globaux pour TensorFlow.js
declare global {
  interface Window {
    tf: any;
    handpose: any;
    blazeface: any;
  }
}

interface WebcamFeedbackProps {
  isDetecting: boolean;
  handedness: string | null;
  confidence: number;
  feedback: string;
  onDetection?: (landmarks: any, face?: any) => void;
}

export default function WebcamFeedback({
  isDetecting,
  handedness,
  confidence,
  feedback,
  onDetection,
}: WebcamFeedbackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isCameraFlipped, setIsCameraFlipped] = useState(true); // Effet miroir par défaut
  const handsRef = useRef<any>(null);
  const faceRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const onDetectionRef = useRef(onDetection);

  // Mettre à jour la ref quand onDetection change
  useEffect(() => {
    onDetectionRef.current = onDetection;
  }, [onDetection]);

  // Initialiser et démarrer/arrêter MediaPipe
  useEffect(() => {
    if (!isCameraEnabled || !videoRef.current || !canvasRef.current) {
      return;
    }

    let isActive = true;

    const loadTensorFlowScripts = () => {
      return new Promise((resolve) => {
        // Vérifier si déjà chargé
        if (window.tf && window.handpose && window.blazeface) {
          resolve(true);
          return;
        }

        // Charger TensorFlow.js
        const tfScript = document.createElement('script');
        tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js';
        
        // Charger HandPose
        const handposeScript = document.createElement('script');
        handposeScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/handpose@0.0.7/dist/handpose.min.js';

        // Charger BlazeFace
        const blazefaceScript = document.createElement('script');
        blazefaceScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js';

        let tfLoaded = false;
        let handposeLoaded = false;
        let blazefaceLoaded = false;

        const checkAllLoaded = () => {
          if (tfLoaded && handposeLoaded && blazefaceLoaded) {
            console.log('✅ TensorFlow.js + HandPose + BlazeFace chargés');
            resolve(true);
          }
        };

        tfScript.onload = () => {
          tfLoaded = true;
          checkAllLoaded();
        };

        handposeScript.onload = () => {
          handposeLoaded = true;
          checkAllLoaded();
        };

        blazefaceScript.onload = () => {
          blazefaceLoaded = true;
          checkAllLoaded();
        };

        document.head.appendChild(tfScript);
        document.head.appendChild(handposeScript);
        document.head.appendChild(blazefaceScript);
      });
    };

    const initAndStartCamera = async () => {
      try {
        console.log('Chargement de TensorFlow.js...');
        await loadTensorFlowScripts();

        if (!isActive) return;
        
        // Charger les modèles HandPose et BlazeFace en parallèle
        console.log('🔄 Chargement HandPose + BlazeFace...');
        const [handModel, faceModel] = await Promise.all([
          window.handpose.load(),
          window.blazeface.load()
        ]);
        console.log('✅ Modèles chargés');
        
        handsRef.current = handModel;
        faceRef.current = faceModel;

        // Démarrer la webcam avec résolution réduite pour meilleures performances
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 480, 
            height: 360,
            frameRate: { ideal: 15, max: 20 } // Limiter le framerate
          }
        });

        if (!videoRef.current) return;
        
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        console.log('Webcam démarrée');

        let lastDetectionTime = 0;
        const detectionInterval = 100; // Détecter toutes les 100ms (10 fois par seconde) pour barre très réactive
        let lastLandmarks: any = null; // Stocker les derniers landmarks détectés

        // Boucle de détection optimisée
        const detectHands = async () => {
          if (!isActive || !videoRef.current || !canvasRef.current || !handsRef.current) {
            return;
          }

          try {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (!canvasCtx) return;

            // Dessiner la vidéo sur le canvas
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            // Détecter visage + main toutes les 100ms (throttle)
            const now = Date.now();
            if (now - lastDetectionTime >= detectionInterval) {
              lastDetectionTime = now;

              // Détecter visage ET main en parallèle
              const [facePredictions, handPredictions] = await Promise.all([
                faceRef.current.estimateFaces(videoRef.current, false),
                handsRef.current.estimateHands(videoRef.current)
              ]);

              const face = facePredictions && facePredictions.length > 0 ? facePredictions[0] : null;
              const hand = handPredictions && handPredictions.length > 0 ? handPredictions[0] : null;

              // Log de débogage
              if (face) {
                console.log('👤 Visage détecté:', face);
              } else {
                console.log('❌ Aucun visage détecté');
              }

              if (hand && hand.landmarks) {
                lastLandmarks = hand.landmarks; // Stocker les landmarks
                
                // Appeler le callback avec les landmarks ET le visage
                try {
                  if (onDetectionRef.current) {
                    onDetectionRef.current(hand.landmarks, face);
                  }
                } catch (err) {
                  console.error('Erreur dans onDetection callback:', err);
                }
              } else {
                lastLandmarks = null; // Pas de main détectée
              }

              // Dessiner le visage si détecté
              if (face) {
                const [x1, y1] = face.topLeft;
                const [x2, y2] = face.bottomRight;
                const width = x2 - x1;
                const height = y2 - y1;

                // Rectangle du visage
                canvasCtx.strokeStyle = '#00FF00';
                canvasCtx.lineWidth = 2;
                canvasCtx.strokeRect(x1, y1, width, height);

                // Zones LFPC relatives au visage
                const faceZones = [
                  { y: 0.2, label: '1: Œil', color: 'rgba(0, 255, 0, 0.5)' },
                  { y: 0.4, label: '2: Écart', color: 'rgba(0, 255, 0, 0.5)' },
                  { y: 0.6, label: '3: Bouche', color: 'rgba(0, 255, 0, 0.5)' },
                  { y: 0.9, label: '4: Menton', color: 'rgba(0, 255, 0, 0.5)' }
                ];

                canvasCtx.setLineDash([5, 5]);
                canvasCtx.font = '10px Arial';
                canvasCtx.fillStyle = '#00FF00';

                faceZones.forEach(zone => {
                  const zoneY = y1 + (height * zone.y);
                  canvasCtx.strokeStyle = zone.color;
                  canvasCtx.lineWidth = 1;
                  canvasCtx.beginPath();
                  canvasCtx.moveTo(x1, zoneY);
                  canvasCtx.lineTo(x2, zoneY);
                  canvasCtx.stroke();
                  
                  // Label (corrigé pour le miroir)
                  canvasCtx.save();
                  canvasCtx.scale(-1, 1);
                  canvasCtx.fillText(zone.label, -(x2 - 5), zoneY - 5);
                  canvasCtx.restore();
                });

                canvasCtx.setLineDash([]);
              }
            }

            // Dessiner les derniers landmarks à CHAQUE frame (fluide)
            if (lastLandmarks) {
              // Dessiner les connexions entre les points
              const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Pouce
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Majeur
                [0, 13], [13, 14], [14, 15], [15, 16], // Annulaire
                [0, 17], [17, 18], [18, 19], [19, 20], // Auriculaire
                [5, 9], [9, 13], [13, 17] // Paume
              ];

              canvasCtx.strokeStyle = '#00FF00';
              canvasCtx.lineWidth = 2;
              for (const [start, end] of connections) {
                const [x1, y1] = lastLandmarks[start];
                const [x2, y2] = lastLandmarks[end];
                canvasCtx.beginPath();
                canvasCtx.moveTo(x1, y1);
                canvasCtx.lineTo(x2, y2);
                canvasCtx.stroke();
              }

              // Dessiner les points
              for (let i = 0; i < lastLandmarks.length; i++) {
                const [x, y] = lastLandmarks[i];
                
                // Cercle avec contour
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
                canvasCtx.fillStyle = '#00FF00';
                canvasCtx.fill();
                canvasCtx.strokeStyle = '#FFFFFF';
                canvasCtx.lineWidth = 2;
                canvasCtx.stroke();
              }
            }
          } catch (err) {
            console.error('Erreur détection:', err);
          }

          // Continuer la détection
          if (isActive) {
            requestAnimationFrame(detectHands);
          }
        };

        // Démarrer la boucle de détection
        detectHands();
        
        cameraRef.current = stream;
      } catch (err) {
        console.error('Erreur initialisation:', err);
      }
    };

    initAndStartCamera();

    return () => {
      isActive = false;
      if (cameraRef.current && cameraRef.current.getTracks) {
        cameraRef.current.getTracks().forEach((track: any) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraEnabled]);

  const toggleCamera = () => {
    setIsCameraEnabled(prev => !prev);
  };

  const toggleFlip = () => {
    setIsCameraFlipped(prev => !prev);
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return '#10B981';
    if (confidence >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getFeedbackStyle = () => {
    if (confidence >= 80) return styles.feedbackSuccess;
    if (confidence >= 60) return styles.feedbackWarning;
    return styles.feedbackError;
  };

  return (
    <View style={styles.container}>
      {/* Boutons de contrôle */}
      <View style={styles.controlButtons}>
        <Pressable 
          style={({ pressed }) => [
            styles.toggleButton,
            isCameraEnabled ? styles.toggleButtonOn : styles.toggleButtonOff,
            pressed && styles.toggleButtonPressed
          ]}
          onPress={toggleCamera}
        >
          <Text style={styles.toggleIcon}>{isCameraEnabled ? '📹' : '📷'}</Text>
          <Text style={styles.toggleText}>
            {isCameraEnabled ? 'Désactiver la webcam' : 'Activer la webcam'}
          </Text>
        </Pressable>

        {isCameraEnabled && (
          <Pressable 
            style={({ pressed }) => [
              styles.flipButton,
              pressed && styles.toggleButtonPressed
            ]}
            onPress={toggleFlip}
          >
            <Text style={styles.toggleIcon}>🔄</Text>
            <Text style={styles.toggleText}>
              {isCameraFlipped ? 'Vue normale' : 'Effet miroir'}
            </Text>
          </Pressable>
        )}
      </View>

      {isCameraEnabled ? (
        <>
          {/* Video pour MediaPipe - visible pour debug */}
          <video
            ref={videoRef}
            style={{ 
              position: 'absolute' as const,
              top: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0
            }}
            autoPlay
            playsInline
            muted
          />

          {/* Canvas pour afficher la webcam + overlay */}
          <View style={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                transform: isCameraFlipped ? 'scaleX(-1)' : 'scaleX(1)',
              }}
              width={480}
              height={360}
            />

            {/* Overlay de statut */}
            <View style={styles.statusOverlay}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isDetecting ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.statusDot}>●</Text>
                <Text style={styles.statusText}>
                  {isDetecting ? 'Main détectée' : 'Aucune main'}
                </Text>
              </View>

              {handedness && (
                <View style={styles.handednessBadge}>
                  <Text style={styles.handednessText}>
                    Main {handedness === 'Left' ? 'gauche' : 'droite'}
                  </Text>
                </View>
              )}
            </View>

            {/* Barre de confiance */}
            <View style={styles.confidenceOverlay}>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Précision</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { 
                        width: `${confidence}%`,
                        backgroundColor: getConfidenceColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>{confidence}%</Text>
              </View>
            </View>
          </View>

          {/* Feedback textuel */}
          <View style={[styles.feedbackContainer, getFeedbackStyle()]}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        </>
      ) : (
        <View style={styles.cameraOffContainer}>
          <Text style={styles.cameraOffIcon}>📷</Text>
          <Text style={styles.cameraOffTitle}>Webcam désactivée</Text>
          <Text style={styles.cameraOffText}>
            Cliquez sur le bouton ci-dessus pour activer votre webcam et commencer l'entraînement
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  flipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  toggleButtonOn: {
    backgroundColor: '#10B981',
  },
  toggleButtonOff: {
    backgroundColor: '#3B82F6',
  },
  toggleButtonPressed: {
    opacity: 0.8,
  },
  toggleIcon: {
    fontSize: 20,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraOffContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  cameraOffIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cameraOffTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cameraOffText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  canvasContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  canvas: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusDot: {
    fontSize: 12,
    color: '#FFF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  handednessBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },
  handednessText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  confidenceOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    minWidth: 70,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    minWidth: 45,
    textAlign: 'right',
  },
  feedbackContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  feedbackWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  orientationHint: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -60 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  orientationIcon: {
    fontSize: 20,
  },
  orientationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
