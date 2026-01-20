# 🤚 Détection de Main LFPC avec MediaPipe

## 📋 Vue d'ensemble

Ce module permet la détection de main en temps réel via webcam et la comparaison avec les configurations LFPC (Langue française Parlée Complétée).

## 🛠️ Technologies utilisées

- **MediaPipe Hands** - Détection de 21 landmarks de la main
- **@mediapipe/camera_utils** - Gestion de la webcam
- **@mediapipe/drawing_utils** - Dessin des landmarks
- **React** - Interface utilisateur

## 📁 Structure des fichiers

```
src/
├── components/
│   └── HandDetection.jsx          # Composant principal de détection
├── hooks/
│   └── useHandDetection.js        # Hook custom pour MediaPipe
├── utils/
│   └── lfpcMatcher.js             # Logique de comparaison LFPC
└── app/
    └── HandDetectionDemo.jsx      # Page de démonstration
```

## 🚀 Installation

Les dépendances MediaPipe ont déjà été installées :

```bash
npm install @mediapipe/hands @mediapipe/camera_utils @mediapipe/drawing_utils
```

## 💻 Utilisation

### Exemple basique

```jsx
import HandDetection from '../components/HandDetection';
import { SAMPLE_LFPC_CONFIGS } from '../utils/lfpcMatcher';

function MyComponent() {
  const handleConfigDetected = (config) => {
    console.log('Configuration détectée:', config);
  };

  return (
    <HandDetection
      lfpcConfigs={SAMPLE_LFPC_CONFIGS}
      onConfigDetected={handleConfigDetected}
      showDebugInfo={true}
    />
  );
}
```

### Utilisation du hook `useHandDetection`

```jsx
import { useRef } from 'react';
import { useHandDetection } from '../hooks/useHandDetection';

function CustomComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { landmarks, isDetecting, handedness, startCamera, stopCamera } = 
    useHandDetection({
      videoRef: videoRef.current,
      canvasRef: canvasRef.current,
      onResults: (results) => {
        console.log('Landmarks:', results.landmarks);
        console.log('Main:', results.handedness);
      },
    });

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      <button onClick={startCamera}>Démarrer</button>
      <button onClick={stopCamera}>Arrêter</button>
    </div>
  );
}
```

### Comparaison avec configurations LFPC

```jsx
import { compareWithLFPCConfig } from '../utils/lfpcMatcher';

const lfpcConfigs = [
  {
    id: 1,
    description: "Main sous l'œil",
    voyelles: ["in", "eu", "un"],
    position_number: 1,
    reference_landmarks: [...], // 21 points de référence
  },
  // ... autres configurations
];

// Dans votre callback onResults
const match = compareWithLFPCConfig(landmarks, lfpcConfigs);

if (match) {
  console.log('Position:', match.description);
  console.log('Confiance:', match.confidence + '%');
  console.log('Voyelles:', match.voyelles);
}
```

## 📊 Format des données

### Landmarks MediaPipe

Chaque landmark contient :
```javascript
{
  x: 0.5,      // Position X normalisée (0-1)
  y: 0.3,      // Position Y normalisée (0-1)
  z: -0.1,     // Profondeur relative
}
```

21 landmarks au total :
- **0** : Poignet
- **1-4** : Pouce
- **5-8** : Index
- **9-12** : Majeur
- **13-16** : Annulaire
- **17-20** : Auriculaire

### Configuration LFPC

```javascript
{
  id: 1,
  description: "Main sous l'œil",
  voyelles: ["in", "eu", "un"],
  position_number: 1,
  reference_landmarks: [
    { x: 0.5, y: 0.3, z: -0.1 },
    // ... 20 autres points
  ],
  confidence: 85,  // Ajouté après comparaison
  distance: 0.023  // Ajouté après comparaison
}
```

## 🎯 Algorithme de comparaison

L'algorithme utilise :

1. **Normalisation** : Les landmarks sont normalisés par rapport au poignet
2. **Points clés** : Focus sur 6 points importants (poignet + bout des doigts)
3. **Distance euclidienne** : Calcul de la distance 3D entre chaque point
4. **Score de confiance** : Conversion de la distance en pourcentage (0-100%)

```javascript
// Points clés utilisés pour la comparaison
const keyPoints = [0, 4, 8, 12, 16, 20];

// Seuil de confiance minimum
const MIN_CONFIDENCE = 30; // %
```

## 🔧 Configuration MediaPipe

```javascript
hands.setOptions({
  maxNumHands: 1,              // Détecter une seule main
  modelComplexity: 1,          // 0=lite, 1=full (meilleur pour LFPC)
  minDetectionConfidence: 0.7, // Seuil de détection
  minTrackingConfidence: 0.5,  // Seuil de suivi
});
```

## 📝 Prochaines étapes

### 1. Enregistrer des landmarks de référence

Créer une interface pour enregistrer les positions LFPC :

```jsx
function RecordLandmarks() {
  const [recordedLandmarks, setRecordedLandmarks] = useState(null);

  const handleRecord = (landmarks) => {
    setRecordedLandmarks(landmarks);
    // Sauvegarder dans Supabase
    saveToSupabase(landmarks);
  };

  return (
    <HandDetection
      onConfigDetected={(config) => {
        // Enregistrer les landmarks actuels
        handleRecord(config.landmarks);
      }}
    />
  );
}
```

### 2. Intégrer avec Supabase

Modifier la table `hand_positions` pour stocker les landmarks :

```sql
ALTER TABLE hand_positions 
ADD COLUMN reference_landmarks JSONB;

-- Exemple d'insertion
UPDATE hand_positions 
SET reference_landmarks = '[
  {"x": 0.5, "y": 0.3, "z": -0.1},
  ...
]'::jsonb
WHERE configuration_number = 1;
```

### 3. Charger depuis Supabase

```javascript
const loadLFPCConfigs = async () => {
  const { data, error } = await supabase
    .from('hand_positions')
    .select('*');

  if (data) {
    setLfpcConfigs(data.map(config => ({
      ...config,
      reference_landmarks: JSON.parse(config.reference_landmarks),
    })));
  }
};
```

### 4. Améliorer la précision

- Enregistrer plusieurs exemples par configuration
- Calculer une moyenne des landmarks
- Ajouter des filtres de lissage temporel
- Ajuster les seuils de confiance

## 🎨 Personnalisation

### Changer les couleurs des landmarks

Dans `useHandDetection.js`, fonction `drawHandLandmarks` :

```javascript
// Points clés en rouge
ctx.fillStyle = isKeyPoint ? '#FF0000' : '#00FF00';

// Connexions en vert
ctx.strokeStyle = '#00FF00';
```

### Ajuster la taille du canvas

```javascript
const camera = new Camera(videoRef, {
  onFrame: async () => { ... },
  width: 1280,  // Modifier ici
  height: 720,  // Modifier ici
});
```

## 🐛 Dépannage

### La webcam ne démarre pas

- Vérifier les permissions du navigateur
- Utiliser HTTPS (requis pour getUserMedia)
- Vérifier que la webcam n'est pas utilisée par une autre app

### Aucune main détectée

- Améliorer l'éclairage
- Placer la main plus près de la caméra
- Réduire `minDetectionConfidence` dans les options

### Mauvaise précision

- Enregistrer de meilleurs landmarks de référence
- Augmenter `modelComplexity` à 1
- Utiliser plus de points clés dans la comparaison

## 📚 Ressources

- [MediaPipe Hands Documentation](https://google.github.io/mediapipe/solutions/hands.html)
- [Landmark Index Reference](https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model)
- [LFPC Wikipedia](https://fr.wikipedia.org/wiki/Langue_fran%C3%A7aise_parl%C3%A9e_compl%C3%A9t%C3%A9e)

## 🤝 Contribution

Pour améliorer la détection :

1. Enregistrer vos propres landmarks de référence
2. Tester avec différentes conditions d'éclairage
3. Ajuster les seuils de confiance
4. Partager vos résultats

## 📄 Licence

Ce module fait partie du projet KeepTalking - Application d'apprentissage LFPC.
