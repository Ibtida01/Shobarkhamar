"""
AI Model Inference Module
Loads VGG16 models and performs disease prediction
"""

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import VGG16_Weights
from torchvision import transforms
from PIL import Image
import numpy as np
from typing import Dict, List, Tuple
import os


class VGG16TransferLearning(nn.Module):
    """
    VGG16 with transfer learning for disease classification.
    Must match the exact architecture used during training.
    """
    def __init__(self, num_classes=4):
        super(VGG16TransferLearning, self).__init__()
        
        # Load pre-trained VGG16
        self.vgg16 = models.vgg16(weights=VGG16_Weights.DEFAULT)
        
        # Freeze all convolutional layers
        for param in self.vgg16.features.parameters():
            param.requires_grad = False
        
        # Get number of input features for the classifier
        num_features = self.vgg16.classifier[6].in_features
        
        # Replace the final classifier layer
        self.vgg16.classifier[6] = nn.Linear(num_features, num_classes)
    
    def forward(self, x):
        return self.vgg16(x)


class DiseaseDetector:
    """
    AI-powered disease detection using trained VGG16 models
    """
    
    def __init__(self, model_path: str, device: str = None):
        """
        Initialize the disease detector
        
        Args:
            model_path: Path to the .pth checkpoint file
            device: 'cuda', 'cpu', or None (auto-detect)
        """
        # Auto-detect device
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        print(f"Loading model on device: {self.device}")
        
        # Load checkpoint
        checkpoint = torch.load(model_path, map_location=self.device)
        
        # Extract metadata
        self.num_classes = checkpoint.get('num_classes', 4)
        self.class_to_idx = checkpoint.get('class_to_idx', {
            'cocci': 0,
            'healthy': 1,
            'ncd': 2,
            'salmo': 3
        })
        self.idx_to_class = checkpoint.get('idx_to_class', {
            0: 'cocci',
            1: 'healthy',
            2: 'ncd',
            3: 'salmo'
        })
        
        # Disease full names mapping
        self.disease_names = {
            'cocci': 'Coccidiosis',
            'healthy': 'Healthy',
            'ncd': 'Newcastle Disease',
            'salmo': 'Salmonellosis'
        }
        
        # Initialize model
        self.model = VGG16TransferLearning(num_classes=self.num_classes)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        # Image preprocessing (must match training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=checkpoint.get('normalize_mean', [0.485, 0.456, 0.406]),
                std=checkpoint.get('normalize_std', [0.229, 0.224, 0.225])
            )
        ])
        
        print(f"✓ Model loaded successfully")
        print(f"  Classes: {list(self.class_to_idx.keys())}")
        print(f"  Device: {self.device}")
    
    def predict(self, image_path: str, top_k: int = 3) -> Dict:
        """
        Predict disease from an image
        
        Args:
            image_path: Path to the image file
            top_k: Number of top predictions to return
        
        Returns:
            dict: Prediction results with confidence scores
        """
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Perform inference
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Get top-k predictions
        probs_numpy = probabilities.cpu().numpy()[0]
        top_indices = np.argsort(probs_numpy)[::-1][:top_k]
        
        # Format results
        predictions = []
        for idx in top_indices:
            class_name = self.idx_to_class[idx]
            confidence = float(probs_numpy[idx])
            
            predictions.append({
                'disease_code': class_name,
                'disease_name': self.disease_names.get(class_name, class_name.upper()),
                'confidence': confidence,
                'confidence_percent': round(confidence * 100, 2)
            })
        
        # Primary prediction
        primary = predictions[0]
        
        # Determine severity based on disease and confidence
        severity = self._determine_severity(primary['disease_code'], primary['confidence'])
        
        return {
            'primary_prediction': {
                'disease_code': primary['disease_code'],
                'disease_name': primary['disease_name'],
                'confidence': primary['confidence'],
                'confidence_percent': primary['confidence_percent'],
                'severity': severity
            },
            'all_predictions': predictions,
            'is_healthy': primary['disease_code'] == 'healthy',
            'needs_treatment': primary['disease_code'] != 'healthy' and primary['confidence'] > 0.5
        }
    
    def _determine_severity(self, disease_code: str, confidence: float) -> str:
        """
        Determine severity level based on disease type and confidence
        """
        if disease_code == 'healthy':
            return 'NONE'
        
        # High confidence disease detection
        if confidence >= 0.8:
            if disease_code in ['ncd', 'salmo']:
                return 'CRITICAL'  # Newcastle and Salmonella are highly contagious
            else:
                return 'HIGH'
        elif confidence >= 0.6:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def batch_predict(self, image_paths: List[str]) -> List[Dict]:
        """
        Predict diseases for multiple images
        
        Args:
            image_paths: List of image file paths
        
        Returns:
            list: List of prediction results
        """
        results = []
        for image_path in image_paths:
            try:
                result = self.predict(image_path)
                result['image_path'] = image_path
                result['status'] = 'success'
                results.append(result)
            except Exception as e:
                results.append({
                    'image_path': image_path,
                    'status': 'error',
                    'error': str(e)
                })
        return results


# ========================
# USAGE EXAMPLE
# ========================
if __name__ == "__main__":
    # Example usage
    MODEL_PATH = "vgg16_disease_classifier.pth"
    
    if os.path.exists(MODEL_PATH):
        detector = DiseaseDetector(MODEL_PATH)
        
        # Single prediction
        test_image = "test_image.jpg"
        if os.path.exists(test_image):
            result = detector.predict(test_image)
            
            print("\n" + "="*60)
            print("PREDICTION RESULTS")
            print("="*60)
            print(f"Disease: {result['primary_prediction']['disease_name']}")
            print(f"Confidence: {result['primary_prediction']['confidence_percent']}%")
            print(f"Severity: {result['primary_prediction']['severity']}")
            print(f"Needs Treatment: {result['needs_treatment']}")
            print("\nTop 3 Predictions:")
            for i, pred in enumerate(result['all_predictions'], 1):
                print(f"  {i}. {pred['disease_name']}: {pred['confidence_percent']}%")
    else:
        print(f"Model not found: {MODEL_PATH}")
        print("Please provide the .pth file from your training")
