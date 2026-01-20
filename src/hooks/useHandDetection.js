import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook custom pour la détection de main en temps réel avec MediaPipe
 * @param {Object} options - Options de configuration
 * @param {HTMLVideoElement} options.videoRef - Référence à l'élément video
 * @param {HTMLCanvasElement} options.canvasRef - Référence au canvas pour le dessin
 * @param {Function} options.onResults - Callback appelé à chaque détection
 * @returns {Object} État de la détection
 */
export function useHandDetection({ videoRef, canvasRef, onResults }) {
  const [landmarks, setLandmarks] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [handedness, setHandedness] = useState(null); // 'Left' ou 'Right'
  
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  // Initialiser MediaPipe Hands
  useEffect(() => {
    if (!videoRef || !canvasRef) {
      return;
    }

    // Import dynamique de MediaPipe
    const initMediaPipe = async () => {
      try {
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

    hands.setOptions({
      maxNumHands: 1, // Détecter une seule main
      modelComplexity: 1, // 0 = lite, 1 = full (meilleur pour LFPC)
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

        hands.onResults((results) => {
          const canvasCtx = canvasRef.getContext('2d');
          
          // Effacer le canvas
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.width, canvasRef.height);

          // Dessiner l'image de la webcam
          canvasCtx.drawImage(results.image, 0, 0, canvasRef.width, canvasRef.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handLandmarks = results.multiHandLandmarks[0];
            const handHandedness = results.multiHandedness?.[0]?.label || 'Unknown';

            // Mettre à jour l'état
            setLandmarks(handLandmarks);
            setHandedness(handHandedness);
            setIsDetecting(true);

            // Dessiner les landmarks sur le canvas
            drawHandLandmarks(canvasCtx, handLandmarks, canvasRef.width, canvasRef.height);

            // Callback personnalisé
            if (onResults) {
              onResults({
                landmarks: handLandmarks,
                handedness: handHandedness,
              });
            }
          } else {
            setLandmarks(null);
            setHandedness(null);
            setIsDetecting(false);
          }

          canvasCtx.restore();
        });

        handsRef.current = hands;
      } catch (err) {
        console.error('Erreur initialisation MediaPipe:', err);
        setError('Erreur lors de l\'initialisation de MediaPipe');
      }
    };

    initMediaPipe();

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoRef, canvasRef, onResults]);

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    if (!videoRef || !handsRef.current) {
      setError('Références video ou hands non initialisées');
      return;
    }

    try {
      const { Camera } = await import('@mediapipe/camera_utils');
      
      const camera = new Camera(videoRef, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoRef });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      setError(null);
    } catch (err) {
      console.error('Erreur démarrage caméra:', err);
      setError('Impossible d\'accéder à la webcam. Vérifiez les permissions.');
    }
  }, [videoRef]);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsDetecting(false);
    setLandmarks(null);
    setHandedness(null);
  }, []);

  return {
    landmarks,
    isDetecting,
    handedness,
    error,
    startCamera,
    stopCamera,
  };
}

/**
 * Dessine les landmarks de la main sur le canvas
 */
function drawHandLandmarks(ctx, landmarks, width, height) {
  // Connexions entre les points (structure de la main)
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Pouce
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Majeur
    [0, 13], [13, 14], [14, 15], [15, 16], // Annulaire
    [0, 17], [17, 18], [18, 19], [19, 20], // Auriculaire
    [5, 9], [9, 13], [13, 17], // Paume
  ];

  // Dessiner les connexions
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x * width, startPoint.y * height);
    ctx.lineTo(endPoint.x * width, endPoint.y * height);
    ctx.stroke();
  });

  // Dessiner les points
  landmarks.forEach((landmark, index) => {
    const x = landmark.x * width;
    const y = landmark.y * height;

    // Points clés en rouge, autres en vert
    const isKeyPoint = [0, 4, 8, 12, 16, 20].includes(index);
    ctx.fillStyle = isKeyPoint ? '#FF0000' : '#00FF00';
    
    ctx.beginPath();
    ctx.arc(x, y, isKeyPoint ? 6 : 4, 0, 2 * Math.PI);
    ctx.fill();

    // Numéro du point (optionnel, pour debug)
    if (isKeyPoint) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(index.toString(), x + 8, y - 8);
    }
  });
}
