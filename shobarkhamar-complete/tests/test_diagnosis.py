"""
Tests for diagnosis/detection endpoints.
"""

import pytest
from httpx import AsyncClient
from app.models import Farm, Symptom
from io import BytesIO


class TestDiagnosisManagement:
    """Test diagnosis CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_diagnosis(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm,
        test_symptom: Symptom
    ):
        """Test creating a diagnosis."""
        response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Fish have white spots and are lethargic",
                "symptom_ids": [str(test_symptom.symptom_id)]
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "diagnosis_id" in data
        assert data["farm_id"] == str(test_farm.farm_id)
        assert data["status"] == "OPEN"
        assert data["target_species"] == "FISH"
    
    @pytest.mark.asyncio
    async def test_create_diagnosis_without_auth(
        self, 
        client: AsyncClient,
        test_farm: Farm
    ):
        """Test that diagnosis creation requires auth."""
        response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Test"
            }
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_diagnosis_by_id(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test getting diagnosis details."""
        # First create a diagnosis
        create_response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Test symptoms"
            },
            headers=auth_headers
        )
        diagnosis_id = create_response.json()["diagnosis_id"]
        
        # Get it
        response = await client.get(
            f"/api/v1/detection/{diagnosis_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["diagnosis_id"] == diagnosis_id
    
    @pytest.mark.asyncio
    async def test_get_diagnosis_history(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test getting diagnosis history."""
        # Create some diagnoses
        for i in range(3):
            await client.post(
                "/api/v1/detection/analyze",
                json={
                    "farm_id": str(test_farm.farm_id),
                    "target_species": "FISH",
                    "symptoms_text": f"Test symptoms {i}"
                },
                headers=auth_headers
            )
        
        # Get history
        response = await client.get(
            "/api/v1/detection/history",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "diagnoses" in data
        assert "total" in data
        assert len(data["diagnoses"]) >= 3
    
    @pytest.mark.asyncio
    async def test_update_diagnosis(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test updating diagnosis."""
        # Create diagnosis
        create_response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Original symptoms"
            },
            headers=auth_headers
        )
        diagnosis_id = create_response.json()["diagnosis_id"]
        
        # Update it
        response = await client.put(
            f"/api/v1/detection/{diagnosis_id}",
            json={
                "status": "IN_REVIEW",
                "symptoms_text": "Updated symptoms"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "IN_REVIEW"
        assert data["symptoms_text"] == "Updated symptoms"
    
    @pytest.mark.asyncio
    async def test_delete_diagnosis(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test deleting diagnosis."""
        # Create diagnosis
        create_response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Test"
            },
            headers=auth_headers
        )
        diagnosis_id = create_response.json()["diagnosis_id"]
        
        # Delete it
        response = await client.delete(
            f"/api/v1/detection/{diagnosis_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify deletion
        response = await client.get(
            f"/api/v1/detection/{diagnosis_id}",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestImageUpload:
    """Test image upload for diagnosis."""
    
    @pytest.mark.asyncio
    async def test_upload_diagnosis_image(
        self, 
        client: AsyncClient,
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test uploading image to diagnosis."""
        # Create diagnosis
        create_response = await client.post(
            "/api/v1/detection/analyze",
            json={
                "farm_id": str(test_farm.farm_id),
                "target_species": "FISH",
                "symptoms_text": "Test"
            },
            headers=auth_headers
        )
        diagnosis_id = create_response.json()["diagnosis_id"]
        
        # Create a fake image file
        image_data = BytesIO(b"fake image data")
        image_data.name = "test_image.jpg"
        
        # Upload image
        response = await client.post(
            f"/api/v1/detection/{diagnosis_id}/images",
            files={"file": ("test_image.jpg", image_data, "image/jpeg")},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "diagnosis_image_id" in data
        assert "image_url" in data
        assert data["diagnosis_id"] == diagnosis_id
    
    @pytest.mark.asyncio
    async def test_upload_image_to_nonexistent_diagnosis(
        self, 
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test uploading image to non-existent diagnosis."""
        from uuid import uuid4
        fake_id = uuid4()
        
        image_data = BytesIO(b"fake image data")
        
        response = await client.post(
            f"/api/v1/detection/{fake_id}/images",
            files={"file": ("test_image.jpg", image_data, "image/jpeg")},
            headers=auth_headers
        )
        
        assert response.status_code == 404