"""
Tests for the stateless AI quick-predict endpoints.
  POST /api/v1/detection/fish/predict
  POST /api/v1/detection/poultry/predict

Models are mocked so tests run in CI without .pth files.
"""

import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient
from io import BytesIO
from PIL import Image
import io


def _make_fake_image_bytes() -> bytes:
    """Return bytes of a tiny valid JPEG."""
    img = Image.new("RGB", (10, 10), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


FISH_MOCK_RESULT = {
    "primary_prediction": {
        "disease_code": "healthy_fish",
        "disease_name": "Healthy Fish",
        "confidence": 0.95,
        "confidence_percent": 95.0,
        "severity": "NONE",
    },
    "all_predictions": [
        {"disease_code": "healthy_fish", "disease_name": "Healthy Fish",
         "confidence": 0.95, "confidence_percent": 95.0},
    ],
    "is_healthy": True,
    "needs_treatment": False,
}

POULTRY_MOCK_RESULT = {
    "primary_prediction": {
        "disease_code": "coccidiosis",
        "disease_name": "Coccidiosis",
        "confidence": 0.87,
        "confidence_percent": 87.0,
        "severity": "HIGH",
    },
    "all_predictions": [
        {"disease_code": "coccidiosis", "disease_name": "Coccidiosis",
         "confidence": 0.87, "confidence_percent": 87.0},
    ],
    "is_healthy": False,
    "needs_treatment": True,
}


class TestFishPredictEndpoint:

    @pytest.mark.asyncio
    async def test_fish_predict_requires_auth(self, client: AsyncClient):
        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/fish/predict",
            files={"file": ("fish.jpg", BytesIO(img_bytes), "image/jpeg")},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_fish_predict_no_model_returns_503(
        self, client: AsyncClient, auth_headers: dict
    ):
        """When fish detector is not loaded, endpoint returns 503."""
        client.app.state.ai_detector = None
        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/fish/predict",
            files={"file": ("fish.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )
        assert response.status_code == 503
        assert "Fish" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_fish_predict_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        mock_detector = MagicMock()
        mock_detector.predict.return_value = FISH_MOCK_RESULT
        client.app.state.ai_detector = mock_detector

        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/fish/predict",
            files={"file": ("fish.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "primary_prediction" in data
        assert "is_healthy" in data
        assert "needs_treatment" in data
        assert data["is_healthy"] is True

    @pytest.mark.asyncio
    async def test_fish_predict_returns_top_predictions(
        self, client: AsyncClient, auth_headers: dict
    ):
        mock_detector = MagicMock()
        mock_detector.predict.return_value = FISH_MOCK_RESULT
        client.app.state.ai_detector = mock_detector

        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/fish/predict",
            files={"file": ("fish.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )

        data = response.json()
        assert isinstance(data["all_predictions"], list)
        assert len(data["all_predictions"]) >= 1
        assert "confidence" in data["primary_prediction"]


class TestPoultryPredictEndpoint:

    @pytest.mark.asyncio
    async def test_poultry_predict_requires_auth(self, client: AsyncClient):
        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/poultry/predict",
            files={"file": ("chicken.jpg", BytesIO(img_bytes), "image/jpeg")},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_poultry_predict_no_model_returns_503(
        self, client: AsyncClient, auth_headers: dict
    ):
        client.app.state.poultry_detector = None
        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/poultry/predict",
            files={"file": ("chicken.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )
        assert response.status_code == 503
        assert "Poultry" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_poultry_predict_disease_detected(
        self, client: AsyncClient, auth_headers: dict
    ):
        mock_detector = MagicMock()
        mock_detector.predict.return_value = POULTRY_MOCK_RESULT
        client.app.state.poultry_detector = mock_detector

        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/poultry/predict",
            files={"file": ("chicken.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_healthy"] is False
        assert data["needs_treatment"] is True
        assert data["primary_prediction"]["disease_code"] == "coccidiosis"
        assert data["primary_prediction"]["severity"] == "HIGH"

    @pytest.mark.asyncio
    async def test_poultry_predict_confidence_fields(
        self, client: AsyncClient, auth_headers: dict
    ):
        mock_detector = MagicMock()
        mock_detector.predict.return_value = POULTRY_MOCK_RESULT
        client.app.state.poultry_detector = mock_detector

        img_bytes = _make_fake_image_bytes()
        response = await client.post(
            "/api/v1/detection/poultry/predict",
            files={"file": ("chicken.jpg", BytesIO(img_bytes), "image/jpeg")},
            headers=auth_headers,
        )

        data = response.json()
        primary = data["primary_prediction"]
        assert 0.0 <= primary["confidence"] <= 1.0
        assert 0.0 <= primary["confidence_percent"] <= 100.0
        assert primary["severity"] in {"NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"}
