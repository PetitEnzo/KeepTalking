import React, { useRef, useEffect, useState } from 'react';
import { useHandDetection } from '../hooks/useHandDetection';
import { compareWithLFPCConfig } from '../utils/lfpcMatcher';

/**
 * Composant de détection de main en temps réel avec MediaPipe
 * @param {Object} props
 * @param {Array} props.lfpcConfigs - Configurations LFPC de référence
 * @param {Function} props.onConfigDetected - Callback appelé quand une config est détectée
 * @param {boolean} props.showDebugInfo - Afficher les infos de debug
 */
export default function HandDetection({ 
  lfpcConfigs = [], 
  onConfigDetected,
  showDebugInfo = false 
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [matchedConfig, setMatchedConfig] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Hook de détection de main
  const { 
    landmarks, 
    isDetecting, 
    handedness, 
    error, 
    startCamera, 
    stopCamera 
  } = useHandDetection({
    videoRef: videoRef.current,
    canvasRef: canvasRef.current,
    onResults: (results) => {
      // Comparer avec les configurations LFPC
      if (results.landmarks && lfpcConfigs.length > 0) {
        const match = compareWithLFPCConfig(results.landmarks, lfpcConfigs);
        setMatchedConfig(match);
        
        if (match && onConfigDetected) {
          onConfigDetected(match);
        }
      }
    },
  });

  // Démarrer la caméra au montage du composant
  useEffect(() => {
    if (videoRef.current && canvasRef.current && !isCameraActive) {
      startCamera();
      setIsCameraActive(true);
    }

    return () => {
      stopCamera();
      setIsCameraActive(false);
    };
  }, [startCamera, stopCamera, isCameraActive]);

  // Gérer le redimensionnement du canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🤚 Détection de main LFPC</h2>
        <p style={styles.subtitle}>
          Placez votre main devant la caméra pour détecter la configuration
        </p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      <div style={styles.videoContainer}>
        {/* Video caché (utilisé par MediaPipe) */}
        <video
          ref={videoRef}
          style={styles.hiddenVideo}
          autoPlay
          playsInline
        />

        {/* Canvas pour afficher la webcam + overlay */}
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />

        {/* Overlay de statut */}
        <div style={styles.statusOverlay}>
          <div style={{
            ...styles.statusBadge,
            backgroundColor: isDetecting ? '#10B981' : '#EF4444'
          }}>
            <span style={styles.statusDot}>●</span>
            <span style={styles.statusText}>
              {isDetecting ? 'Main détectée' : 'Aucune main'}
            </span>
          </div>
          
          {handedness && (
            <div style={styles.handednessBadge}>
              Main {handedness === 'Left' ? 'gauche' : 'droite'}
            </div>
          )}
        </div>
      </div>

      {/* Résultat de la détection */}
      {matchedConfig && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <span style={styles.resultIcon}>✅</span>
            <h3 style={styles.resultTitle}>Configuration détectée</h3>
          </div>
          
          <div style={styles.resultContent}>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Position:</span>
              <span style={styles.resultValue}>{matchedConfig.description}</span>
            </div>
            
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Voyelles:</span>
              <span style={styles.resultValue}>
                {matchedConfig.voyelles?.join(', ') || 'N/A'}
              </span>
            </div>
            
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Confiance:</span>
              <div style={styles.confidenceContainer}>
                <div style={styles.confidenceBar}>
                  <div style={{
                    ...styles.confidenceFill,
                    width: `${matchedConfig.confidence}%`,
                    backgroundColor: matchedConfig.confidence > 70 ? '#10B981' : 
                                    matchedConfig.confidence > 50 ? '#F59E0B' : '#EF4444'
                  }} />
                </div>
                <span style={styles.confidenceText}>{matchedConfig.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations de debug */}
      {showDebugInfo && landmarks && (
        <div style={styles.debugCard}>
          <h4 style={styles.debugTitle}>🔍 Debug Info</h4>
          <div style={styles.debugContent}>
            <p style={styles.debugText}>
              <strong>Landmarks détectés:</strong> {landmarks.length} points
            </p>
            <p style={styles.debugText}>
              <strong>Main:</strong> {handedness || 'N/A'}
            </p>
            <p style={styles.debugText}>
              <strong>Distance:</strong> {matchedConfig?.distance?.toFixed(4) || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={styles.instructionsCard}>
        <h4 style={styles.instructionsTitle}>📋 Instructions</h4>
        <ul style={styles.instructionsList}>
          <li style={styles.instructionItem}>
            Placez votre main bien visible devant la caméra
          </li>
          <li style={styles.instructionItem}>
            Assurez-vous d'avoir un bon éclairage
          </li>
          <li style={styles.instructionItem}>
            Maintenez votre main stable pour une meilleure détection
          </li>
          <li style={styles.instructionItem}>
            Les points verts représentent les landmarks de votre main
          </li>
          <li style={styles.instructionItem}>
            Les points rouges sont les points clés (poignet, bout des doigts)
          </li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '20px',
  },
  errorText: {
    color: '#991B1B',
    fontSize: '14px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto 24px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hiddenVideo: {
    display: 'none',
  },
  canvas: {
    width: '100%',
    height: 'auto',
    display: 'block',
    backgroundColor: '#000',
  },
  statusOverlay: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  statusDot: {
    fontSize: '12px',
    color: '#FFF',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFF',
  },
  handednessBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    color: '#FFF',
    fontSize: '13px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  resultCard: {
    backgroundColor: '#F0FDF4',
    border: '2px solid #86EFAC',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  resultIcon: {
    fontSize: '24px',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#166534',
    margin: 0,
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  resultLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
    minWidth: '100px',
  },
  resultValue: {
    fontSize: '14px',
    color: '#15803D',
    fontWeight: '500',
  },
  confidenceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  confidenceBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#D1FAE5',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  confidenceText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
    minWidth: '45px',
  },
  debugCard: {
    backgroundColor: '#F3F4F6',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  debugTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '12px',
  },
  debugContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  debugText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '8px',
    padding: '16px',
  },
  instructionsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: '12px',
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  instructionItem: {
    fontSize: '14px',
    color: '#1E40AF',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
};
