"""
Tests for farm management endpoints.
"""

import pytest
from httpx import AsyncClient
from app.models import Farm, User


class TestFarmManagement:
    """Test farm CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_farm_success(
        self, 
        client: AsyncClient, 
        auth_headers: dict
    ):
        """Test successful farm creation."""
        response = await client.post(
            "/api/v1/farms",
            json={
                "farm_name": "Green Valley Farm",
                "farm_type": "FISH",
                "area_size": 15.5,
                "address": "456 Farm Road"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["farm_name"] == "Green Valley Farm"
        assert data["farm_type"] == "FISH"
        assert data["area_size"] == 15.5
        assert "farm_id" in data
    
    @pytest.mark.asyncio
    async def test_create_farm_without_auth(self, client: AsyncClient):
        """Test farm creation without authentication."""
        response = await client.post(
            "/api/v1/farms",
            json={
                "farm_name": "Test Farm",
                "farm_type": "POULTRY",
                "area_size": 10.0
            }
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_farms_list(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test getting list of user's farms."""
        response = await client.get(
            "/api/v1/farms",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "farms" in data
        assert "total" in data
        assert len(data["farms"]) >= 1
        assert data["farms"][0]["farm_name"] == "Test Farm"
    
    @pytest.mark.asyncio
    async def test_get_farm_by_id(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test getting farm by ID."""
        response = await client.get(
            f"/api/v1/farms/{test_farm.farm_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["farm_id"] == str(test_farm.farm_id)
        assert data["farm_name"] == "Test Farm"
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_farm(
        self, 
        client: AsyncClient, 
        auth_headers: dict
    ):
        """Test getting non-existent farm."""
        from uuid import uuid4
        fake_id = uuid4()
        
        response = await client.get(
            f"/api/v1/farms/{fake_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_farm(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test updating farm."""
        response = await client.put(
            f"/api/v1/farms/{test_farm.farm_id}",
            json={
                "farm_name": "Updated Farm Name",
                "area_size": 20.0
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["farm_name"] == "Updated Farm Name"
        assert data["area_size"] == 20.0
    
    @pytest.mark.asyncio
    async def test_delete_farm(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test deleting farm."""
        response = await client.delete(
            f"/api/v1/farms/{test_farm.farm_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify farm is deleted
        response = await client.get(
            f"/api/v1/farms/{test_farm.farm_id}",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestFarmUnitManagement:
    """Test farm unit operations."""
    
    @pytest.mark.asyncio
    async def test_create_farm_unit(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test creating farm unit."""
        response = await client.post(
            "/api/v1/farms/units",
            json={
                "farm_id": str(test_farm.farm_id),
                "unit_type": "POND",
                "unit_name": "Pond A1",
                "target_species": "FISH"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["unit_name"] == "Pond A1"
        assert data["unit_type"] == "POND"
        assert data["target_species"] == "FISH"
    
    @pytest.mark.asyncio
    async def test_update_farm_unit(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test updating farm unit."""
        # First create a unit
        create_response = await client.post(
            "/api/v1/farms/units",
            json={
                "farm_id": str(test_farm.farm_id),
                "unit_type": "COOP",
                "unit_name": "Coop B1",
                "target_species": "POULTRY"
            },
            headers=auth_headers
        )
        unit_id = create_response.json()["unit_id"]
        
        # Update it
        response = await client.put(
            f"/api/v1/farms/units/{unit_id}",
            json={
                "unit_name": "Updated Coop B1"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["unit_name"] == "Updated Coop B1"
    
    @pytest.mark.asyncio
    async def test_delete_farm_unit(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_farm: Farm
    ):
        """Test deleting farm unit."""
        # First create a unit
        create_response = await client.post(
            "/api/v1/farms/units",
            json={
                "farm_id": str(test_farm.farm_id),
                "unit_type": "TANK",
                "unit_name": "Tank C1",
                "target_species": "FISH"
            },
            headers=auth_headers
        )
        unit_id = create_response.json()["unit_id"]
        
        # Delete it
        response = await client.delete(
            f"/api/v1/farms/units/{unit_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204