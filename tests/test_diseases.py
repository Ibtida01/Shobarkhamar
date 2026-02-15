"""
Tests for disease and symptom management endpoints.
"""

import pytest
from httpx import AsyncClient
from app.models import Disease, Symptom


class TestDiseaseManagement:
    """Test disease CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_get_diseases_list(
        self, 
        client: AsyncClient,
        test_disease: Disease
    ):
        """Test getting list of diseases (public endpoint)."""
        response = await client.get("/api/v1/diseases")
        
        assert response.status_code == 200
        data = response.json()
        assert "diseases" in data
        assert "total" in data
        assert len(data["diseases"]) >= 1
    
    @pytest.mark.asyncio
    async def test_get_disease_by_id(
        self, 
        client: AsyncClient,
        test_disease: Disease
    ):
        """Test getting disease details."""
        response = await client.get(
            f"/api/v1/diseases/{test_disease.disease_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["disease_name"] == "White Spot Disease"
        assert data["target_species"] == "FISH"
    
    @pytest.mark.asyncio
    async def test_create_disease_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_symptom: Symptom
    ):
        """Test creating disease as admin."""
        response = await client.post(
            "/api/v1/diseases",
            json={
                "disease_name": "Fin Rot",
                "target_species": "FISH",
                "description": "Bacterial infection of fins",
                "contagious": True,
                "severity_level": "MEDIUM",
                "symptom_ids": [str(test_symptom.symptom_id)]
            },
            headers=admin_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["disease_name"] == "Fin Rot"
        assert data["contagious"] is True
        assert len(data["symptoms"]) == 1
    
    @pytest.mark.asyncio
    async def test_create_disease_as_farmer_fails(
        self, 
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test that farmers cannot create diseases."""
        response = await client.post(
            "/api/v1/diseases",
            json={
                "disease_name": "Test Disease",
                "target_species": "FISH",
                "severity_level": "LOW"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_create_duplicate_disease_fails(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_disease: Disease
    ):
        """Test creating disease with duplicate name."""
        response = await client.post(
            "/api/v1/diseases",
            json={
                "disease_name": "White Spot Disease",  # Already exists
                "target_species": "FISH",
                "severity_level": "HIGH"
            },
            headers=admin_headers
        )
        
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_update_disease_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_disease: Disease
    ):
        """Test updating disease as admin."""
        response = await client.put(
            f"/api/v1/diseases/{test_disease.disease_id}",
            json={
                "description": "Updated description",
                "severity_level": "MEDIUM"
            },
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["severity_level"] == "MEDIUM"
    
    @pytest.mark.asyncio
    async def test_delete_disease_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_disease: Disease
    ):
        """Test deleting disease as admin."""
        response = await client.delete(
            f"/api/v1/diseases/{test_disease.disease_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 204
        
        # Verify deletion
        response = await client.get(
            f"/api/v1/diseases/{test_disease.disease_id}"
        )
        assert response.status_code == 404


class TestSymptomManagement:
    """Test symptom CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_get_symptoms_list(
        self, 
        client: AsyncClient,
        test_symptom: Symptom
    ):
        """Test getting list of symptoms."""
        response = await client.get("/api/v1/symptoms")
        
        assert response.status_code == 200
        symptoms = response.json()
        assert len(symptoms) >= 1
    
    @pytest.mark.asyncio
    async def test_get_symptom_by_id(
        self, 
        client: AsyncClient,
        test_symptom: Symptom
    ):
        """Test getting symptom details."""
        response = await client.get(
            f"/api/v1/symptoms/{test_symptom.symptom_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["symptom_name"] == "White spots on body"
    
    @pytest.mark.asyncio
    async def test_create_symptom_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict
    ):
        """Test creating symptom as admin."""
        response = await client.post(
            "/api/v1/symptoms",
            json={
                "symptom_name": "Lethargy",
                "target_species": "FISH",
                "symptom_description": "Fish appears sluggish"
            },
            headers=admin_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["symptom_name"] == "Lethargy"
    
    @pytest.mark.asyncio
    async def test_create_symptom_as_farmer_fails(
        self, 
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test that farmers cannot create symptoms."""
        response = await client.post(
            "/api/v1/symptoms",
            json={
                "symptom_name": "Test Symptom",
                "target_species": "FISH"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_update_symptom_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_symptom: Symptom
    ):
        """Test updating symptom as admin."""
        response = await client.put(
            f"/api/v1/symptoms/{test_symptom.symptom_id}",
            json={
                "symptom_description": "Updated description"
            },
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["symptom_description"] == "Updated description"
    
    @pytest.mark.asyncio
    async def test_delete_symptom_as_admin(
        self, 
        client: AsyncClient,
        admin_headers: dict,
        test_symptom: Symptom
    ):
        """Test deleting symptom as admin."""
        response = await client.delete(
            f"/api/v1/symptoms/{test_symptom.symptom_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 204