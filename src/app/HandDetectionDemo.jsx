import React, { useState, useEffect } from 'react';
import HandDetection from '../components/HandDetection';
import { SAMPLE_LFPC_CONFIGS } from '../utils/lfpcMatcher';

/**
 * Page de démonstration de la détection de main LFPC
 * Exemple d'utilisation du composant HandDetection
 */
export default function HandDetectionDemo() {
  const [lfpcConfigs, setLfpcConfigs] = useState([]);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  // Charger les configurations LFPC
  // Dans un vrai projet, ces données viendraient de Supabase
  useEffect(() => {
    // Pour la démo, on utilise les configurations d'exemple
    // En production, vous devriez charger les vraies données avec les landmarks de référence
    loadLFPCConfigs();
  }, []);

  const loadLFPCConfigs = async () => {
    // Simulation de chargement depuis Supabase
    // Dans la vraie app, remplacer par:
    // const { data } = await supabase.from('hand_positions').select('*');
    
    // Pour l'instant, on utilise les configs d'exemple
    setLfpcConfigs(SAMPLE_LFPC_CONFIGS);
    
    console.log('Configurations LFPC chargées:', SAMPLE_LFPC_CONFIGS.length);
  };

  // Callback appelé quand une configuration est détectée
  const handleConfigDetected = (config) => {
    console.log('Configuration détectée:', config);
    
    // Ajouter à l'historique (limité aux 5 dernières détections)
    setDetectionHistory(prev => {
      const newHistory = [
        {
          timestamp: new Date().toLocaleTimeString(),
          config: config.description,
          confidence: config.confidence,
        },
        ...prev
      ].slice(0, 5);
      return newHistory;
    });
  };

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>🎯 Détection LFPC en temps réel</h1>
        <p style={styles.description}>
          Testez la détection de configurations LFPC avec votre webcam
        </p>
      </div>

      {/* Contrôles */}
      <div style={styles.controls}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(e) => setShowDebug(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>Afficher les infos de debug</span>
        </label>
      </div>

      {/* Composant de détection */}
      <HandDetection
        lfpcConfigs={lfpcConfigs}
        onConfigDetected={handleConfigDetected}
        showDebugInfo={showDebug}
      />

      {/* Historique des détections */}
      {detectionHistory.length > 0 && (
        <div style={styles.historyCard}>
          <h3 style={styles.historyTitle}>📊 Historique des détections</h3>
          <div style={styles.historyList}>
            {detectionHistory.map((item, index) => (
              <div key={index} style={styles.historyItem}>
                <div style={styles.historyTime}>{item.timestamp}</div>
                <div style={styles.historyConfig}>{item.config}</div>
                <div style={styles.historyConfidence}>
                  <span style={{
                    ...styles.confidenceBadge,
                    backgroundColor: item.confidence > 70 ? '#10B981' : 
                                    item.confidence > 50 ? '#F59E0B' : '#EF4444'
                  }}>
                    {item.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations sur les configurations */}
      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>ℹ️ Configurations LFPC disponibles</h3>
        <div style={styles.configGrid}>
          {SAMPLE_LFPC_CONFIGS.map((config) => (
            <div key={config.id} style={styles.configCard}>
              <div style={styles.configNumber}>Position {config.position_number}</div>
              <div style={styles.configDescription}>{config.description}</div>
              <div style={styles.configVowels}>
                {config.voyelles.map((v, i) => (
                  <span key={i} style={styles.vowelBadge}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note importante */}
      <div style={styles.noteCard}>
        <div style={styles.noteIcon}>⚠️</div>
        <div style={styles.noteContent}>
          <h4 style={styles.noteTitle}>Note importante</h4>
          <p style={styles.noteText}>
            Pour que la détection fonctionne correctement, vous devez d'abord enregistrer 
            des landmarks de référence pour chaque configuration LFPC. Actuellement, 
            les configurations d'exemple n'ont pas de landmarks de référence, donc la 
            comparaison ne fonctionnera pas encore.
          </p>
          <p style={styles.noteText}>
            <strong>Prochaines étapes :</strong>
          </p>
          <ul style={styles.noteList}>
            <li>Créer une interface pour enregistrer les landmarks de référence</li>
            <li>Stocker ces landmarks dans Supabase (table hand_positions)</li>
            <li>Charger les vrais landmarks depuis la base de données</li>
            <li>Ajuster les seuils de confiance selon vos besoins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  mainTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
  },
  description: {
    fontSize: '18px',
    color: '#6B7280',
  },
  controls: {
    maxWidth: '800px',
    margin: '0 auto 24px',
    padding: '16px',
    backgroundColor: '#FFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#374151',
  },
  historyCard: {
    maxWidth: '800px',
    margin: '24px auto',
    padding: '20px',
    backgroundColor: '#FFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  historyTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '16px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  historyTime: {
    fontSize: '13px',
    color: '#6B7280',
    minWidth: '80px',
    fontFamily: 'monospace',
  },
  historyConfig: {
    flex: 1,
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  historyConfidence: {
    minWidth: '60px',
  },
  confidenceBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    maxWidth: '800px',
    margin: '24px auto',
    padding: '20px',
    backgroundColor: '#FFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '16px',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  configCard: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  configNumber: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '4px',
  },
  configDescription: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  configVowels: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  vowelBadge: {
    padding: '2px 8px',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '12px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  noteCard: {
    maxWidth: '800px',
    margin: '24px auto',
    padding: '20px',
    backgroundColor: '#FEF3C7',
    border: '2px solid #FCD34D',
    borderRadius: '12px',
    display: 'flex',
    gap: '16px',
  },
  noteIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: '8px',
  },
  noteText: {
    fontSize: '14px',
    color: '#78350F',
    lineHeight: '1.6',
    marginBottom: '8px',
  },
  noteList: {
    marginLeft: '20px',
    marginTop: '8px',
  },
};
