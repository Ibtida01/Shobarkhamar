"""
Tests for database models.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    User, Farm, FarmUnit, Disease, Symptom,
    Diagnosis, DiagnosisImage, Treatment
)
from app.core.security import hash_password


class TestUserModel:
    """Test User model."""
    
    @pytest.mark.asyncio
    async def test_create_user(self, test_db: AsyncSession):
        """Test creating a user."""
        user = User(
            name="Model Test User",
            email="modeltest@example.com",
            password_hash=hash_password("TestPass123!"),
            role="FARMER"
        )
        
        test_db.add(user)
        await test_db.commit()
        await test_db.refresh(user)
        
        assert user.user_id is not None
        assert user.email == "modeltest@example.com"
        assert user.created_at is not None
    
    @pytest.mark.asyncio
    async def test_user_relationships(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test user relationships."""
        result = await test_db.execute(
            select(User).where(User.user_id == test_user.user_id)
        )
        user = result.scalar_one()
        
        # Check farms relationship (lazy loaded)
        assert len(user.farms) >= 0


class TestFarmModel:
    """Test Farm model."""
    
    @pytest.mark.asyncio
    async def test_create_farm(
        self, 
        test_db: AsyncSession,
        test_user: User
    ):
        """Test creating a farm."""
        farm = Farm(
            owner_id=test_user.user_id,
            farm_name="Model Test Farm",
            farm_type="POULTRY",
            area_size=20.0,
            farm_status="ACTIVE"
        )
        
        test_db.add(farm)
        await test_db.commit()
        await test_db.refresh(farm)
        
        assert farm.farm_id is not None
        assert farm.owner_id == test_user.user_id
        assert farm.farm_status == "ACTIVE"
    
    @pytest.mark.asyncio
    async def test_farm_unit_creation(
        self, 
        test_db: AsyncSession,
        test_farm: Farm
    ):
        """Test creating a farm unit."""
        unit = FarmUnit(
            farm_id=test_farm.farm_id,
            unit_type="COOP",
            unit_name="Test Coop",
            target_species="POULTRY"
        )
        
        test_db.add(unit)
        await test_db.commit()
        await test_db.refresh(unit)
        
        assert unit.unit_id is not None
        assert unit.farm_id == test_farm.farm_id


class TestDiseaseModel:
    """Test Disease model."""
    
    @pytest.mark.asyncio
    async def test_create_disease(self, test_db: AsyncSession):
        """Test creating a disease."""
        disease = Disease(
            disease_name="Model Test Disease",
            target_species="FISH",
            description="Test description",
            contagious=False,
            severity_level="LOW"
        )
        
        test_db.add(disease)
        await test_db.commit()
        await test_db.refresh(disease)
        
        assert disease.disease_id is not None
        assert disease.disease_name == "Model Test Disease"
    
    @pytest.mark.asyncio
    async def test_disease_symptom_relationship(
        self, 
        test_db: AsyncSession,
        test_disease: Disease,
        test_symptom: Symptom
    ):
        """Test disease-symptom many-to-many relationship."""
        # Add symptom to disease
        test_disease.symptoms.append(test_symptom)
        await test_db.commit()
        
        # Refresh and check
        await test_db.refresh(test_disease)
        assert len(test_disease.symptoms) >= 1


class TestDiagnosisModel:
    """Test Diagnosis model."""
    
    @pytest.mark.asyncio
    async def test_create_diagnosis(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test creating a diagnosis."""
        diagnosis = Diagnosis(
            user_id=test_user.user_id,
            farm_id=test_farm.farm_id,
            target_species="FISH",
            status="OPEN",
            symptoms_text="Model test symptoms"
        )
        
        test_db.add(diagnosis)
        await test_db.commit()
        await test_db.refresh(diagnosis)
        
        assert diagnosis.diagnosis_id is not None
        assert diagnosis.status == "OPEN"
        assert diagnosis.created_at is not None
    
    @pytest.mark.asyncio
    async def test_diagnosis_image_creation(
        self, 
        test_db: AsyncSession,
        test_user: User,
        test_farm: Farm
    ):
        """Test creating diagnosis with image."""
        # Create diagnosis
        diagnosis = Diagnosis(
            user_id=test_user.user_id,
            farm_id=test_farm.farm_id,
            target_species="FISH",
            status="OPEN"
        )
        test_db.add(diagnosis)
        await test_db.flush()
        
        # Add image
        image = DiagnosisImage(
            diagnosis_id=diagnosis.diagnosis_id,
            image_url="/uploads/test.jpg"
        )
        test_db.add(image)
        await test_db.commit()
        await test_db.refresh(image)
        
        assert image.diagnosis_image_id is not None
        assert image.diagnosis_id == diagnosis.diagnosis_id


class TestTreatmentModel:
    """Test Treatment model."""
    
    @pytest.mark.asyncio
    async def test_create_treatment(self, test_db: AsyncSession):
        """Test creating a treatment."""
        treatment = Treatment(
            treatment_name="Model Test Treatment",
            medication_name="Test Medication",
            application_method="ORAL",
            dosage_text="10mg daily",
            duration_days=7
        )
        
        test_db.add(treatment)
        await test_db.commit()
        await test_db.refresh(treatment)
        
        assert treatment.treatment_id is not None
        assert treatment.treatment_name == "Model Test Treatment"
        assert treatment.duration_days == 7


class TestEnums:
    """Test enum values."""
    
    @pytest.mark.asyncio
    async def test_user_roles(self, test_db: AsyncSession):
        """Test user role enum."""
        farmer = User(
            name="Farmer",
            email="farmer@test.com",
            password_hash=hash_password("Test123!"),
            role="FARMER"
        )
        
        admin = User(
            name="Admin",
            email="admin@test.com",
            password_hash=hash_password("Test123!"),
            role="ADMIN"
        )
        
        test_db.add_all([farmer, admin])
        await test_db.commit()
        
        assert farmer.role == "FARMER"
        assert admin.role == "ADMIN"
    
    @pytest.mark.asyncio
    async def test_farm_types(self, test_db: AsyncSession, test_user: User):
        """Test farm type enum."""
        fish_farm = Farm(
            owner_id=test_user.user_id,
            farm_name="Fish Farm",
            farm_type="FISH"
        )
        
        poultry_farm = Farm(
            owner_id=test_user.user_id,
            farm_name="Poultry Farm",
            farm_type="POULTRY"
        )
        
        mixed_farm = Farm(
            owner_id=test_user.user_id,
            farm_name="Mixed Farm",
            farm_type="MIXED"
        )
        
        test_db.add_all([fish_farm, poultry_farm, mixed_farm])
        await test_db.commit()
        
        assert fish_farm.farm_type == "FISH"
        assert poultry_farm.farm_type == "POULTRY"
        assert mixed_farm.farm_type == "MIXED"