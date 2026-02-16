import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native';

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
  detectFace?: boolean; // Activer/désactiver la détection de visage
}

export default function WebcamFeedback({
  isDetecting,
  handedness,
  confidence,
  feedback,
  onDetection,
  detectFace = true, // Par défaut, détection de visage activée
}: WebcamFeedbackProps) {
  const { width } = useWindowDimensions();
  const isMobileOrTablet = width < 1024;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isCameraFlipped, setIsCameraFlipped] = useState(true); // Effet miroir par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [infoMessageIndex, setInfoMessageIndex] = useState(0);
  const handsRef = useRef<any>(null);
  const faceRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const onDetectionRef = useRef(onDetection);

  // Mettre à jour la ref quand onDetection change
  useEffect(() => {
    onDetectionRef.current = onDetection;
  }, [onDetection]);

  // Rotation des messages informatifs toutes les 5 secondes pendant le chargement
  useEffect(() => {
    if (!isLoading) return;

    const infoMessages = [
      "Si nécessaire, autorisez l'accès à votre webcam dans votre navigateur via la pop-up",
      "L'opération peut prendre quelques dizaines de secondes le temps d'initialiser les différents modules",
      "Tout fonctionne en local dans votre navigateur, aucune donnée n'est envoyée !"
    ];

    const interval = setInterval(() => {
      setInfoMessageIndex((prev) => (prev + 1) % infoMessages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Initialiser et démarrer/arrêter MediaPipe
  useEffect(() => {
    if (!isCameraEnabled || !videoRef.current || !canvasRef.current) {
      // Arrêter la caméra si elle est désactivée
      if (!isCameraEnabled) {
        setIsLoading(false);
        if (cameraRef.current && cameraRef.current.getTracks) {
          cameraRef.current.getTracks().forEach((track: any) => track.stop());
          cameraRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Initialisation...');

    const loadTensorFlowScripts = () => {
      return new Promise((resolve) => {
        // Vérifier si déjà chargé
        if (window.tf && window.handpose && window.blazeface) {
          setLoadingProgress(30);
          setLoadingMessage('Modèles déjà chargés');
          resolve(true);
          return;
        }
        
        setLoadingProgress(10);
        setLoadingMessage('Chargement de TensorFlow.js...');

        // Charger TensorFlow.js
        const tfScript = document.createElement('script');
        tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js';
        
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
          console.log('✅ TensorFlow.js chargé');
          tfLoaded = true;
          setLoadingProgress(20);
          setLoadingMessage('TensorFlow.js chargé');
          // Charger HandPose et BlazeFace seulement après TensorFlow
          document.head.appendChild(handposeScript);
          document.head.appendChild(blazefaceScript);
        };

        handposeScript.onload = () => {
          console.log('✅ HandPose chargé');
          handposeLoaded = true;
          setLoadingProgress(25);
          setLoadingMessage('HandPose chargé');
          checkAllLoaded();
        };

        blazefaceScript.onload = () => {
          console.log('✅ BlazeFace chargé');
          blazefaceLoaded = true;
          setLoadingProgress(30);
          setLoadingMessage('BlazeFace chargé');
          checkAllLoaded();
        };

        // Charger TensorFlow en premier
        document.head.appendChild(tfScript);
      });
    };

    const initAndStartCamera = async () => {
      try {
        console.log('Chargement de TensorFlow.js...');
        await loadTensorFlowScripts();

        if (!isActive) return;
        
        // Attendre un peu pour s'assurer que les scripts sont bien chargés
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Charger les modèles HandPose et BlazeFace en parallèle (si nécessaire)
        if (detectFace) {
          console.log('🔄 Chargement HandPose + BlazeFace...');
          
          // Vérifier que les modèles sont disponibles
          if (!window.handpose || !window.blazeface) {
            throw new Error('Modèles TensorFlow non disponibles');
          }
          
          const [handModel, faceModel] = await Promise.all([
            window.handpose.load(),
            window.blazeface.load()
          ]);
          console.log('✅ Modèles chargés');
          
          handsRef.current = handModel;
          faceRef.current = faceModel;
        } else {
          console.log('🔄 Chargement HandPose uniquement...');
          
          // Vérifier que le modèle est disponible
          if (!window.handpose) {
            throw new Error('Modèle HandPose non disponible');
          }
          
          setLoadingProgress(40);
          setLoadingMessage('Chargement du modèle de détection...');
          const handModel = await window.handpose.load();
          console.log('✅ Modèle chargé');
          setLoadingProgress(60);
          setLoadingMessage('Modèle de détection chargé');
          
          handsRef.current = handModel;
          faceRef.current = null;
        }

        // Démarrer la webcam avec résolution HD pour une meilleure qualité
        setLoadingProgress(70);
        setLoadingMessage('Connexion à la webcam...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'user' // Caméra frontale
          }
        });

        console.log('✅ Stream obtenu', stream);

        if (!videoRef.current) {
          console.error('❌ videoRef.current est null');
          setIsLoading(false);
          return;
        }
        
        videoRef.current.srcObject = stream;
        setLoadingProgress(85);
        setLoadingMessage('Démarrage de la webcam...');
        
        console.log('📹 Tentative de lecture de la vidéo...');
        await videoRef.current.play();
        
        console.log('✅ Webcam démarrée');
        setLoadingProgress(95);
        setLoadingMessage('Finalisation...');

        // Attendre que la vidéo soit prête et ajuster la taille du canvas
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            const handleMetadata = () => {
              console.log('📐 Métadonnées vidéo chargées');
              if (videoRef.current && canvasRef.current) {
                // Adapter la taille du canvas à la résolution réelle de la vidéo
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                console.log(`✅ Canvas ajusté: ${canvasRef.current.width}x${canvasRef.current.height}`);
              }
              setLoadingProgress(100);
              setLoadingMessage('Prêt !');
              console.log('🎉 Désactivation du loader...');
              
              // Attendre que le loader se masque et que le canvas soit rendu avant de démarrer detectHands
              setTimeout(() => {
                setIsLoading(false);
                // Démarrer detectHands après que le canvas soit rendu
                setTimeout(() => {
                  console.log('🚀 Démarrage de la boucle detectHands...');
                  detectHands();
                }, 100);
              }, 500);
              
              resolve();
            };

            // Si les métadonnées sont déjà chargées, appeler directement
            if (videoRef.current.readyState >= 1) {
              console.log('✅ Métadonnées déjà disponibles');
              handleMetadata();
            } else {
              videoRef.current.onloadedmetadata = handleMetadata;
            }
          } else {
            console.error('❌ videoRef.current est null dans la Promise');
            setIsLoading(false);
            resolve();
          }
        });

        let lastDetectionTime = 0;
        const detectionInterval = 100; // Détecter toutes les 100ms (10 fois par seconde) pour barre très réactive
        let lastLandmarks: any = null; // Stocker les derniers landmarks détectés
        let lastLandmarksTime = 0; // Timestamp des derniers landmarks pour persistance

        // Boucle de détection optimisée
        const detectHands = async () => {
          if (!isActive || !videoRef.current || !canvasRef.current || !handsRef.current) {
            console.log('❌ detectHands arrêté:', { isActive, hasVideo: !!videoRef.current, hasCanvas: !!canvasRef.current, hasHands: !!handsRef.current });
            return;
          }

          try {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (!canvasCtx) {
              console.error('❌ Impossible d\'obtenir le contexte 2D du canvas');
              return;
            }

            // Dessiner la vidéo sur le canvas avec la taille réelle
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Log uniquement toutes les 30 frames (~1 seconde)
            if (Math.random() < 0.033) {
              console.log('🎨 Canvas dessiné:', { 
                canvasSize: `${canvasRef.current.width}x${canvasRef.current.height}`,
                videoSize: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
                videoReadyState: videoRef.current.readyState
              });
            }

            // Détecter visage + main toutes les 100ms (throttle)
            const now = Date.now();
            if (now - lastDetectionTime >= detectionInterval) {
              lastDetectionTime = now;

              // Détecter main et visage (si activé)
              let face = null;
              let handPredictions;
              
              if (detectFace && faceRef.current) {
                const [facePredictions, handPreds] = await Promise.all([
                  faceRef.current.estimateFaces(videoRef.current, false),
                  handsRef.current.estimateHands(videoRef.current)
                ]);
                face = facePredictions && facePredictions.length > 0 ? facePredictions[0] : null;
                handPredictions = handPreds;
              } else {
                handPredictions = await handsRef.current.estimateHands(videoRef.current);
              }

              const hand = handPredictions && handPredictions.length > 0 ? handPredictions[0] : null;

              // Log de débogage TOUJOURS pour comprendre le problème
              console.log('👋 Détection mains:', {
                nbPredictions: handPredictions ? handPredictions.length : 0,
                hasHand: !!hand,
                hasLandmarks: hand ? !!hand.landmarks : false,
                landmarksLength: hand && hand.landmarks ? hand.landmarks.length : 0
              });

              if (hand && hand.landmarks) {
                console.log('✅ Stockage landmarks dans lastLandmarks');
                lastLandmarks = hand.landmarks; // Stocker les landmarks
                lastLandmarksTime = now; // Mettre à jour le timestamp
                
                // Appeler le callback UNIQUEMENT si la caméra est activée
                if (onDetectionRef.current && isCameraEnabled) {
                  try {
                    onDetectionRef.current(hand.landmarks, face);
                  } catch (err) {
                    console.error('Erreur dans onDetection callback:', err);
                  }
                }
              } else {
                // Sur mobile, garder les landmarks pendant 300ms pour plus de fluidité
                const landmarksPersistenceDuration = isMobileOrTablet ? 300 : 100;
                if (!lastLandmarks || (now - lastLandmarksTime > landmarksPersistenceDuration)) {
                  lastLandmarks = null; // Effacer les landmarks après le délai
                }
                
                // Appeler le callback UNIQUEMENT si la caméra est activée
                if (onDetectionRef.current && isCameraEnabled) {
                  try {
                    onDetectionRef.current(null, face);
                  } catch (err) {
                    console.error('Erreur dans onDetection callback:', err);
                  }
                }
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
              // Calculer le ratio de mise à l'échelle entre la vidéo source et le canvas
              const scaleX = canvasRef.current.width / videoRef.current.videoWidth;
              const scaleY = canvasRef.current.height / videoRef.current.videoHeight;
              
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
                // Adapter les coordonnées de l'espace vidéo à l'espace canvas
                const [x1Video, y1Video] = lastLandmarks[start];
                const [x2Video, y2Video] = lastLandmarks[end];
                const x1 = x1Video * scaleX;
                const y1 = y1Video * scaleY;
                const x2 = x2Video * scaleX;
                const y2 = y2Video * scaleY;
                
                canvasCtx.beginPath();
                canvasCtx.moveTo(x1, y1);
                canvasCtx.lineTo(x2, y2);
                canvasCtx.stroke();
              }

              // Dessiner les points
              for (let i = 0; i < lastLandmarks.length; i++) {
                // Adapter les coordonnées de l'espace vidéo à l'espace canvas
                const [xVideo, yVideo] = lastLandmarks[i];
                const x = xVideo * scaleX;
                const y = yVideo * scaleY;
                
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

  // Désactiver la caméra automatiquement quand on quitte la page
  useEffect(() => {
    return () => {
      // Cleanup : arrêter la caméra quand le composant est démonté
      if (cameraRef.current && cameraRef.current.getTracks) {
        cameraRef.current.getTracks().forEach((track: any) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

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
      {/* Boutons de contrôle - Desktop uniquement */}
      {!isMobileOrTablet && (
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
      )}

      {/* Video pour MediaPipe - toujours rendu mais caché */}
      {isCameraEnabled && (
        <video
          ref={videoRef}
          style={{ 
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none' as const
          }}
          autoPlay
          playsInline
          muted
        />
      )}

      {isLoading && (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderSpinner}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          <Text style={styles.loaderText}>{loadingMessage}</Text>
          
          {/* Barre de progression */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${loadingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{loadingProgress}%</Text>
          
          {/* Message informatif rotatif */}
          <View style={styles.infoHint}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              {infoMessageIndex === 0 && "Si nécessaire, autorisez l'accès à votre webcam dans votre navigateur via la pop-up"}
              {infoMessageIndex === 1 && "L'opération peut prendre quelques dizaines de secondes le temps d'initialiser les différents modules"}
              {infoMessageIndex === 2 && "Tout fonctionne en local dans votre navigateur, aucune donnée n'est envoyée !"}
            </Text>
          </View>
          
          <Text style={styles.loaderSubtext}>
            {loadingProgress < 30 ? 'Chargement des bibliothèques...' :
             loadingProgress < 70 ? 'Initialisation des modèles de détection...' :
             'Prêt dans quelques instants...'}
          </Text>
        </View>
      )}

      {isCameraEnabled && !isLoading ? (
        <>

          {/* Canvas pour afficher la webcam + overlay */}
          <View style={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                transform: isCameraFlipped ? 'scaleX(-1)' : 'scaleX(1)',
                objectFit: 'cover',
              }}
              width={480}
              height={360}
            />

            {/* Overlay de statut - Desktop uniquement */}
            {!isMobileOrTablet && (
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
            )}

            {/* Bouton activer/désactiver webcam - Mobile uniquement (overlay) */}
            {isMobileOrTablet && (
              <Pressable 
                style={({ pressed }) => [
                  styles.webcamToggleButton,
                  { backgroundColor: isCameraEnabled ? '#10B981' : '#3B82F6' },
                  pressed && styles.toggleButtonPressed
                ]}
                onPress={toggleCamera}
              >
                <Text style={styles.webcamToggleIcon}>{isCameraEnabled ? '📹' : '📷'}</Text>
              </Pressable>
            )}

            {/* Barre de confiance et statut - Côte à côte sur mobile */}
            <View style={isMobileOrTablet ? styles.bottomOverlayMobile : styles.confidenceOverlay}>
              {isMobileOrTablet && (
                <View style={[
                  styles.statusBadgeMobile,
                  { backgroundColor: isDetecting ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.statusDot}>●</Text>
                  <Text style={styles.statusTextMobile}>
                    {isDetecting ? 'Main' : 'Aucune'}
                  </Text>
                </View>
              )}
              <View style={isMobileOrTablet ? styles.confidenceContainerMobile : styles.confidenceContainer}>
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
        <>
          {!isMobileOrTablet && (
            <View style={styles.cameraOffContainer}>
              <Text style={styles.cameraOffIcon}>📷</Text>
              <Text style={styles.cameraOffTitle}>Webcam désactivée</Text>
              <Text style={styles.cameraOffText}>
                Cliquez sur le bouton ci-dessus pour activer votre webcam et commencer l'entraînement
              </Text>
            </View>
          )}
          
          {/* Bouton activer caméra sur mobile quand elle est éteinte */}
          {isMobileOrTablet && (
            <Pressable 
              style={({ pressed }) => [
                styles.activateCameraButtonMobile,
                pressed && styles.toggleButtonPressed
              ]}
              onPress={toggleCamera}
            >
              <Text style={styles.activateCameraIconMobile}>📷</Text>
              <Text style={styles.activateCameraTextMobile}>Activer la caméra</Text>
            </Pressable>
          )}
        </>
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
    borderRadius: 0,
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
  bottomOverlayMobile: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statusBadgeMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusTextMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  confidenceContainerMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
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
  webcamToggleButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webcamToggleIcon: {
    fontSize: 28,
  },
  activateCameraButtonMobile: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activateCameraIconMobile: {
    fontSize: 24,
  },
  activateCameraTextMobile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    minHeight: 300,
  },
  loaderSpinner: {
    marginBottom: 20,
  },
  loaderIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  loaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 400,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 16,
    maxWidth: 400,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    textAlign: 'left',
  },
  loaderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
