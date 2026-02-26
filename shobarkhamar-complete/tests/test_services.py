"""
Tests for service layer business logic.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.services import (
    UserService, 
    FarmService, 
    DiseaseService, 
    DiagnosisService
)
from app.schemas import (
    UserCreate, 
    FarmCreate, 
    DiseaseCreate, 
    DiagnosisCreate
)
from app.models import User, Farm, Disease


class TestUserService:
    """Test UserService methods."""
    
    @pytest.mark.asyncio
    async def test_create_user(self, test_db: AsyncSession):
        """Test creating a user."""
        user_data = UserCreate(
            name="Service Test User",
            email="servicetest@example.com",
            password="TestPass123!"
        )
        
        user = await UserService.create(test_db, user_data)
        
        assert user.name == "Service Test User"
        assert user.email == "servicetest@example.com"
        assert user.user_id is not None
    
    @pytest.mark.asyncio
    async def test_get_user_by_email(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test getting user by email."""
        user = await UserService.get_by_email(test_db, "test@example.com")
        
        assert user is not None
        assert user.email == "test@example.com"
    
    @pytest.mark.asyncio
    async def test_get_user_by_id(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test getting user by ID."""
        user = await UserService.get_by_id(test_db, test_user.user_id)
        
        assert user is not None
        assert user.user_id == test_user.user_id
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_user(self, test_db: AsyncSession):
        """Test getting non-existent user raises exception."""
        from uuid import uuid4
        
        with pytest.raises(HTTPException) as exc_info:
            await UserService.get_by_id(test_db, uuid4())
        
        assert exc_info.value.status_code == 404
    
    @pytest.mark.asyncio
    async def test_authenticate_user(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test user authentication."""
        user = await UserService.authenticate(
            test_db, 
            "test@example.com", 
            "TestPass123!"
        )
        
        assert user is not None
        assert user.email == "test@example.com"
    
    @pytest.mark.asyncio
    async def test_authenticate_wrong_password(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test authentication with wrong password."""
        with pytest.raises(HTTPException) as exc_info:
            await UserService.authenticate(
                test_db, 
                "test@example.com", 
                "WrongPassword"
            )
        
        assert exc_info.value.status_code == 401


class TestFarmService:
    """Test FarmService methods."""
    
    @pytest.mark.asyncio
    async def test_create_farm(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test creating a farm."""
        farm_data = FarmCreate(
            farm_name="Service Test Farm",
            farm_type="FISH",
            area_size=12.5,
            address="789 Test St"
        )
        
        farm = await FarmService.create(
            test_db, 
            test_user.user_id, 
            farm_data
        )
        
        assert farm.farm_name == "Service Test Farm"
        assert farm.owner_id == test_user.user_id
    
    @pytest.mark.asyncio
    async def test_get_farms_by_owner(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test getting farms by owner."""
        farms = await FarmService.get_by_owner(test_db, test_user.user_id)
        
        assert len(farms) >= 1
        assert farms[0].owner_id == test_user.user_id
    
    @pytest.mark.asyncio
    async def test_get_farm_by_id(
        self, 
        test_db: AsyncSession,
        test_farm: Farm
    ):
        """Test getting farm by ID."""
        farm = await FarmService.get_by_id(test_db, test_farm.farm_id)
        
        assert farm is not None
        assert farm.farm_id == test_farm.farm_id


class TestDiseaseService:
    """Test DiseaseService methods."""
    
    @pytest.mark.asyncio
    async def test_create_disease(self, test_db: AsyncSession):
        """Test creating a disease."""
        disease_data = DiseaseCreate(
            disease_name="Service Test Disease",
            target_species="FISH",
            description="Test disease",
            contagious=True,
            severity_level="HIGH"
        )
        
        disease = await DiseaseService.create(test_db, disease_data)
        
        assert disease.disease_name == "Service Test Disease"
        assert disease.contagious is True
    
    @pytest.mark.asyncio
    async def test_get_disease_by_id(
        self, 
        test_db: AsyncSession,
        test_disease: Disease
    ):
        """Test getting disease by ID."""
        disease = await DiseaseService.get_by_id(
            test_db, 
            test_disease.disease_id
        )
        
        assert disease is not None
        assert disease.disease_id == test_disease.disease_id
    
    @pytest.mark.asyncio
    async def test_get_all_diseases(
        self, 
        test_db: AsyncSession,
        test_disease: Disease
    ):
        """Test getting all diseases."""
        diseases = await DiseaseService.get_all(test_db)
        
        assert len(diseases) >= 1


class TestDiagnosisService:
    """Test DiagnosisService methods."""
    
    @pytest.mark.asyncio
    async def test_create_diagnosis(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test creating a diagnosis."""
        diagnosis_data = DiagnosisCreate(
            farm_id=test_farm.farm_id,
            target_species="FISH",
            symptoms_text="Test symptoms"
        )
        
        diagnosis = await DiagnosisService.create(
            test_db, 
            test_user.user_id, 
            diagnosis_data
        )
        
        assert diagnosis.user_id == test_user.user_id
        assert diagnosis.farm_id == test_farm.farm_id
        assert diagnosis.status == "OPEN"
    
    @pytest.mark.asyncio
    async def test_get_diagnosis_by_user(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test getting diagnoses by user."""
        # Create a diagnosis
        diagnosis_data = DiagnosisCreate(
            farm_id=test_farm.farm_id,
            target_species="FISH",
            symptoms_text="Test"
        )
        await DiagnosisService.create(
            test_db, 
            test_user.user_id, 
            diagnosis_data
        )
        
        # Get diagnoses
        diagnoses = await DiagnosisService.get_by_user(
            test_db, 
            test_user.user_id
        )
        
        assert len(diagnoses) >= 1
        assert diagnoses[0].user_id == test_user.user_id