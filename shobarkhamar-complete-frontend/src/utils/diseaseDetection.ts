// Mock disease detection logic
// In production, this would call an actual AI/ML API

interface DetectionResult {
  isHealthy: boolean;
  disease?: string;
  confidence: number;
  symptoms: string[];
  treatment: {
    immediate: string[];
    medication: string[];
    prevention: string[];
  };
  severity: 'low' | 'medium' | 'high';
}

const fishDiseases = [
  {
    name: 'Ichthyophthirius (Ich / White Spot Disease)',
    confidence: 87,
    symptoms: [
      'White spots covering body and fins',
      'Fish rubbing against objects',
      'Rapid gill movement',
      'Loss of appetite',
    ],
    treatment: {
      immediate: [
        'Isolate affected fish immediately',
        'Raise water temperature to 82-86°F gradually',
        'Increase aeration in tank',
      ],
      medication: [
        'Apply aquarium salt (1 tablespoon per 5 gallons)',
        'Use copper-based medication as per instructions',
        'Consider malachite green treatment',
      ],
      prevention: [
        'Quarantine new fish for 2-3 weeks',
        'Maintain optimal water quality',
        'Avoid overcrowding',
        'Regular water changes (25% weekly)',
      ],
    },
    severity: 'high' as const,
  },
  {
    name: 'Columnaris (Cotton Wool Disease)',
    confidence: 82,
    symptoms: [
      'White/gray patches on body',
      'Frayed or deteriorating fins',
      'Lesions around mouth and gills',
      'Lethargy and loss of color',
    ],
    treatment: {
      immediate: [
        'Improve water quality immediately',
        'Reduce stress factors',
        'Lower water temperature slightly',
      ],
      medication: [
        'Antibiotic treatment (Kanamycin or Nitrofurazone)',
        'Salt baths (1% solution for 10-15 minutes)',
        'Oxytetracycline in food',
      ],
      prevention: [
        'Maintain clean water conditions',
        'Avoid injuries and stress',
        'Proper nutrition',
        'Regular tank maintenance',
      ],
    },
    severity: 'medium' as const,
  },
  {
    name: 'Fin Rot',
    confidence: 79,
    symptoms: [
      'Ragged, frayed fin edges',
      'Discoloration of fins (white/red)',
      'Fins appear shorter',
      'Inflammation at fin base',
    ],
    treatment: {
      immediate: [
        'Perform 50% water change',
        'Remove any sharp decorations',
        'Isolate severely affected fish',
      ],
      medication: [
        'Antibacterial medication (API Fin and Body Cure)',
        'Aquarium salt treatment',
        'Methylene blue baths',
      ],
      prevention: [
        'Maintain excellent water quality',
        'Avoid fin-nipping tank mates',
        'Regular monitoring',
        'Balanced diet with vitamins',
      ],
    },
    severity: 'low' as const,
  },
];

const poultryDiseases = [
  {
    name: 'Coccidiosis',
    confidence: 91,
    symptoms: [
      'Bloody or dark-colored droppings',
      'Dehydration and weakness',
      'Ruffled feathers',
      'Reduced appetite and weight loss',
    ],
    treatment: {
      immediate: [
        'Isolate affected birds',
        'Ensure constant access to clean water',
        'Keep housing clean and dry',
      ],
      medication: [
        'Amprolium medication in water (follow dosage)',
        'Sulfadimethoxine treatment',
        'Vitamin K supplements',
      ],
      prevention: [
        'Maintain dry, clean bedding',
        'Use medicated starter feed for chicks',
        'Proper ventilation in coop',
        'Regular cleaning and disinfection',
      ],
    },
    severity: 'high' as const,
  },
  {
    name: 'Newcastle Disease',
    confidence: 85,
    symptoms: [
      'Greenish, watery droppings',
      'Respiratory distress',
      'Neurological signs (twisted neck)',
      'Decreased egg production',
    ],
    treatment: {
      immediate: [
        'Quarantine flock immediately',
        'Contact veterinary authorities',
        'Improve biosecurity measures',
      ],
      medication: [
        'No specific treatment available',
        'Supportive care with vitamins',
        'Antibiotics for secondary infections',
      ],
      prevention: [
        'Vaccination program (essential)',
        'Strict biosecurity protocols',
        'Limit visitor access',
        'Proper sanitation',
      ],
    },
    severity: 'high' as const,
  },
  {
    name: 'Infectious Bronchitis',
    confidence: 78,
    symptoms: [
      'Watery droppings with white urates',
      'Respiratory symptoms',
      'Decreased egg production',
      'Poor egg shell quality',
    ],
    treatment: {
      immediate: [
        'Improve ventilation',
        'Reduce stress factors',
        'Provide warm, dry environment',
      ],
      medication: [
        'No specific cure available',
        'Antibiotics for secondary bacterial infections',
        'Vitamin and electrolyte supplements',
      ],
      prevention: [
        'Vaccination (multiple strains)',
        'All-in, all-out management',
        'Biosecurity measures',
        'Avoid mixing age groups',
      ],
    },
    severity: 'medium' as const,
  },
];

export function detectDisease(type: 'fish' | 'poultry'): DetectionResult {
  // Simulate random detection
  const random = Math.random();
  
  // 20% chance of being healthy
  if (random < 0.2) {
    return {
      isHealthy: true,
      confidence: Math.floor(Math.random() * 10) + 90,
      symptoms: [],
      treatment: {
        immediate: [],
        medication: [],
        prevention: [],
      },
      severity: 'low',
    };
  }
  
  // 80% chance of disease detection
  const diseases = type === 'fish' ? fishDiseases : poultryDiseases;
  const selectedDisease = diseases[Math.floor(Math.random() * diseases.length)];
  
  return {
    isHealthy: false,
    disease: selectedDisease.name,
    confidence: selectedDisease.confidence,
    symptoms: selectedDisease.symptoms,
    treatment: selectedDisease.treatment,
    severity: selectedDisease.severity,
  };
}
