"""
Model file: best_model.pt
Architecture: MobileNet_V3_Large
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_large, MobileNet_V3_Large_Weights
from PIL import Image
from typing import Dict

POULTRY_CLASS_NAMES = [
    "cocci",
    "healthy",
    "ncd",
    "non_poultry",
    "other_disease",
    "salmo",
]

HEALTHY_CLASSES = {"healthy", "non_poultry"}

SEVERITY_MAP = {
    "ncd":   "CRITICAL",
    "salmo": "HIGH",
    "cocci": "HIGH",
}


class PoultryDiseaseDetector:
    def __init__(self, model_path: str, device: str = None):
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        print(f"Loading poultry model on device: {self.device}")

        # Build MobileNetV3-Large with custom head (matches training)
        self.model = mobilenet_v3_large(weights=None)
        in_features = self.model.classifier[3].in_features
        self.model.classifier[3] = nn.Sequential(
            nn.Dropout(p=0.4, inplace=True),
            nn.Linear(in_features, len(POULTRY_CLASS_NAMES)),
        )

        state_dict = torch.load(model_path, map_location=self.device, weights_only=False)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.class_names = POULTRY_CLASS_NAMES

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])
        print("✓ Poultry model loaded successfully")
        print(f"  Classes: {self.class_names}")

    def predict(self, image_path: str, top_k: int = 3) -> Dict:
        img = Image.open(image_path).convert("RGB")
        tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]

        top_probs, top_idxs = torch.topk(probs, k=min(top_k, len(self.class_names)))

        predictions = []
        for prob, idx in zip(top_probs.tolist(), top_idxs.tolist()):
            name = self.class_names[idx]
            predictions.append({
                "disease_code": name,
                "disease_name": name.replace("_", " ").title(),
                "confidence": prob,
                "confidence_percent": round(prob * 100, 2),
            })

        primary = predictions[0]
        is_healthy = primary["disease_code"] in HEALTHY_CLASSES
        confidence = primary["confidence"]

        if is_healthy:
            severity = "NONE"
        elif confidence >= 0.8:
            severity = SEVERITY_MAP.get(primary["disease_code"], "HIGH")
        elif confidence >= 0.6:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return {
            "primary_prediction": {**primary, "severity": severity},
            "all_predictions": predictions,
            "is_healthy": is_healthy,
            "needs_treatment": not is_healthy and confidence > 0.5,
        }