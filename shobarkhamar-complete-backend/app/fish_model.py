"""
AI Model Inference Module
EfficientNet-B4 for fish disease classification.

Architecture: EfficientNet-B4 (torchvision)
Image size:   380x380 (B4 default)
Classes:      8 (sorted alphabetically from folder names)

Index → Class mapping:
  0: Bacterial Red disease
  1: Bacterial diseases - Aeromoniasis
  2: Bacterial gill disease
  3: Fungal diseases Saprolegniasis
  4: Healthy Fish
  5: Not_fish
  6: Parasitic diseases
  7: Viral diseases White tail disease
"""

import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b4, EfficientNet_B4_Weights
from PIL import Image
import numpy as np
from typing import Dict, List
import os


IDX_TO_CLASS = {
    0: 'Bacterial Red disease',
    1: 'Bacterial diseases - Aeromoniasis',
    2: 'Bacterial gill disease',
    3: 'Fungal diseases Saprolegniasis',
    4: 'Healthy Fish',
    5: 'Not_fish',
    6: 'Parasitic diseases',
    7: 'Viral diseases White tail disease',
}

# Which classes are considered "healthy" (no treatment needed)
HEALTHY_CLASSES = {'Healthy Fish', 'Not_fish'}


class DiseaseDetector:

    def __init__(self, model_path: str, device: str = None):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        print(f"Loading model on device: {self.device}")

        state_dict = torch.load(model_path, map_location=self.device, weights_only=False)

        self.num_classes = len(IDX_TO_CLASS)
        self.idx_to_class = IDX_TO_CLASS
        self.class_to_idx = {v: k for k, v in IDX_TO_CLASS.items()}

        # Build EfficientNet-B4 with custom head
        self.model = efficientnet_b4(weights=None)
        in_features = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(in_features, self.num_classes)

        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        # B4 image size is 380x380
        self.transform = transforms.Compose([
            transforms.Resize((380, 380)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        print(f"✓ Model loaded successfully")
        print(f"  Classes: {list(IDX_TO_CLASS.values())}")
        print(f"  Device: {self.device}")

    def predict(self, image_path: str, top_k: int = 3) -> Dict:
        image = Image.open(image_path).convert('RGB')
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)

        probs_np = probs.cpu().numpy()[0]
        top_indices = np.argsort(probs_np)[::-1][:top_k]

        predictions = []
        for idx in top_indices:
            name = self.idx_to_class[idx]
            conf = float(probs_np[idx])
            predictions.append({
                'disease_code':       name.lower().replace(' ', '_'),
                'disease_name':       name,
                'confidence':         conf,
                'confidence_percent': round(conf * 100, 2),
            })

        primary = predictions[0]
        is_healthy = primary['disease_name'] in HEALTHY_CLASSES
        severity = self._severity(primary['disease_name'], primary['confidence'])

        return {
            'primary_prediction': {**primary, 'severity': severity},
            'all_predictions':    predictions,
            'is_healthy':         is_healthy,
            'needs_treatment':    not is_healthy and primary['confidence'] > 0.5,
        }

    def _severity(self, disease_name: str, confidence: float) -> str:
        if disease_name in HEALTHY_CLASSES:
            return 'NONE'
        if confidence >= 0.8:
            return 'CRITICAL' if disease_name in (
                'Viral diseases White tail disease',
                'Bacterial Red disease'
            ) else 'HIGH'
        if confidence >= 0.6:
            return 'MEDIUM'
        return 'LOW'

    def batch_predict(self, image_paths: List[str]) -> List[Dict]:
        results = []
        for path in image_paths:
            try:
                r = self.predict(path)
                r['image_path'] = path
                r['status'] = 'success'
            except Exception as e:
                r = {'image_path': path, 'status': 'error', 'error': str(e)}
            results.append(r)
        return results