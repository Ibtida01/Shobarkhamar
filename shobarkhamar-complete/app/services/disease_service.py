from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from typing import List
from app.models.disease import Disease, Symptom
from app.schemas.disease import DiseaseCreate, DiseaseUpdate, SymptomCreate, SymptomUpdate


class DiseaseService:
    """Service for disease-related operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, disease_id: UUID) -> Disease:
        """Get disease by ID"""
        result = await db.execute(
            select(Disease)
            .options(selectinload(Disease.symptoms))
            .where(Disease.disease_id == disease_id)
        )
        disease = result.scalar_one_or_none()
        
        if not disease:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disease not found"
            )
        
        return disease
    
    @staticmethod
    async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Disease]:
        """Get all diseases"""
        result = await db.execute(
            select(Disease)
            .options(selectinload(Disease.symptoms))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def create(db: AsyncSession, disease_data: DiseaseCreate) -> Disease:
        """Create new disease"""
        # Check if disease name already exists
        result = await db.execute(
            select(Disease).where(Disease.disease_name == disease_data.disease_name)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Disease name already exists"
            )
        
        # Create disease
        disease = Disease(
            disease_name=disease_data.disease_name,
            target_species=disease_data.target_species,
            description=disease_data.description,
            contagious=disease_data.contagious,
            severity_level=disease_data.severity_level
        )
        
        # Add symptoms
        if disease_data.symptom_ids:
            for symptom_id in disease_data.symptom_ids:
                symptom = await SymptomService.get_by_id(db, symptom_id)
                disease.symptoms.append(symptom)
        
        db.add(disease)
        await db.commit()
        await db.refresh(disease)
        
        return disease
    
    @staticmethod
    async def update(db: AsyncSession, disease_id: UUID, disease_data: DiseaseUpdate) -> Disease:
        """Update disease"""
        disease = await DiseaseService.get_by_id(db, disease_id)
        
        # Update basic fields
        for field, value in disease_data.dict(exclude_unset=True, exclude={'symptom_ids'}).items():
            setattr(disease, field, value)
        
        # Update symptoms if provided
        if disease_data.symptom_ids is not None:
            disease.symptoms = []
            for symptom_id in disease_data.symptom_ids:
                symptom = await SymptomService.get_by_id(db, symptom_id)
                disease.symptoms.append(symptom)
        
        await db.commit()
        await db.refresh(disease)
        
        return disease
    
    @staticmethod
    async def delete(db: AsyncSession, disease_id: UUID) -> None:
        """Delete disease"""
        disease = await DiseaseService.get_by_id(db, disease_id)
        await db.delete(disease)
        await db.commit()


class SymptomService:
    """Service for symptom-related operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, symptom_id: UUID) -> Symptom:
        """Get symptom by ID"""
        result = await db.execute(select(Symptom).where(Symptom.symptom_id == symptom_id))
        symptom = result.scalar_one_or_none()
        
        if not symptom:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symptom not found"
            )
        
        return symptom
    
    @staticmethod
    async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Symptom]:
        """Get all symptoms"""
        result = await db.execute(
            select(Symptom)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def create(db: AsyncSession, symptom_data: SymptomCreate) -> Symptom:
        """Create new symptom"""
        symptom = Symptom(**symptom_data.dict())
        
        db.add(symptom)
        await db.commit()
        await db.refresh(symptom)
        
        return symptom
    
    @staticmethod
    async def update(db: AsyncSession, symptom_id: UUID, symptom_data: SymptomUpdate) -> Symptom:
        """Update symptom"""
        symptom = await SymptomService.get_by_id(db, symptom_id)
        
        for field, value in symptom_data.dict(exclude_unset=True).items():
            setattr(symptom, field, value)
        
        await db.commit()
        await db.refresh(symptom)
        
        return symptom
    
    @staticmethod
    async def delete(db: AsyncSession, symptom_id: UUID) -> None:
        """Delete symptom"""
        symptom = await SymptomService.get_by_id(db, symptom_id)
        await db.delete(symptom)
        await db.commit()