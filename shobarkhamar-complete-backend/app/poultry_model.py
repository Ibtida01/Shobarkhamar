"""
Model file: best_model.pt
"""

import os
import torch
import torchvision.transforms as transforms
from PIL import Image
from pathlib import Path
from typing import Dict

POULTRY_CLASS_NAMES = [
    "cocci",
    "healthy",
    "ncd",
    "non_poultry",
    "other_disease"
    "salmo",
]

HEALTHY_CLASSES = {"healthy", "non_poultry"}

SEVERITY_MAP = {
    "ncd": "CRITICAL",
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

        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        self.model = self._build_model(checkpoint)
        self.model.eval()
        self.model.to(self.device)

        self.class_names = POULTRY_CLASS_NAMES

        self.transform = transforms.Compose([
            transforms.Resize((384, 384)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])
        print("✓ Poultry model loaded successfully")
        print(f"  Classes: {self.class_names}")

    def _build_model(self, checkpoint):
        if isinstance(checkpoint, torch.nn.Module):
            return checkpoint

        state_dict = checkpoint.get("state_dict", checkpoint)
        arch = self._infer_arch(state_dict)
        num_classes = self._infer_num_classes(state_dict)

        if num_classes != len(POULTRY_CLASS_NAMES):
            raise ValueError(
                f"Model has {num_classes} classes, but POULTRY_CLASS_NAMES has {len(POULTRY_CLASS_NAMES)}."
            )

        model = self._make_efficientnetv2(arch, num_classes)
        model.load_state_dict(state_dict)
        return model

    def _infer_arch(self, state_dict):
        stem = tuple(state_dict["features.0.0.weight"].shape)
        last = tuple(state_dict["features.8.0.weight"].shape)
        variants = {
            ((24, 3, 3, 3), (1280, 256, 1, 1)): "s",
            ((24, 3, 3, 3), (1280, 512, 1, 1)): "m",
            ((32, 3, 3, 3), (1280, 640, 1, 1)): "l",
        }
        if (stem, last) not in variants:
            raise ValueError(f"Unknown EfficientNetV2 checkpoint shape: stem={stem}, last={last}")
        return variants[(stem, last)]

    def _infer_num_classes(self, state_dict):
        w = state_dict.get("classifier.1.weight")
        b = state_dict.get("classifier.1.bias")
        if w is not None:
            return int(w.shape[0])
        if b is not None:
            return int(b.shape[0])
        raise ValueError("Cannot infer num_classes from checkpoint.")

    def _make_efficientnetv2(self, arch, num_classes):
        from torchvision.models import efficientnet_v2_s, efficientnet_v2_m, efficientnet_v2_l
        constructors = {"s": efficientnet_v2_s, "m": efficientnet_v2_m, "l": efficientnet_v2_l}
        return constructors[arch](weights=None, num_classes=num_classes)

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
