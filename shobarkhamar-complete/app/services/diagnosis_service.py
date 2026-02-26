from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile
from uuid import UUID
from typing import List
import os
from datetime import datetime
from app.models.diagnosis import Diagnosis, DiagnosisSymptom, DiagnosisImage
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisUpdate
from app.core.config import settings


class DiagnosisService:
    """Service for diagnosis-related operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, diagnosis_id: UUID) -> Diagnosis:
        """Get diagnosis by ID"""
        result = await db.execute(
            select(Diagnosis)
            .options(
                selectinload(Diagnosis.images),
                selectinload(Diagnosis.symptoms),
                selectinload(Diagnosis.final_disease)
            )
            .where(Diagnosis.diagnosis_id == diagnosis_id)
        )
        diagnosis = result.scalar_one_or_none()
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        return diagnosis
    
    @staticmethod
    async def get_by_user(
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Diagnosis]:
        """Get all diagnoses for a user"""
        result = await db.execute(
            select(Diagnosis)
            .options(
                selectinload(Diagnosis.images),
                selectinload(Diagnosis.final_disease)
            )
            .where(Diagnosis.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Diagnosis.created_at.desc())
        )
        return result.scalars().all()
    
    @staticmethod
    async def create(
        db: AsyncSession,
        user_id: UUID,
        diagnosis_data: DiagnosisCreate
    ) -> Diagnosis:
        """Create new diagnosis"""
        diagnosis = Diagnosis(
            user_id=user_id,
            farm_id=diagnosis_data.farm_id,
            unit_id=diagnosis_data.unit_id,
            target_species=diagnosis_data.target_species,
            symptoms_text=diagnosis_data.symptoms_text
        )
        
        db.add(diagnosis)
        await db.flush()
        
        # Add symptoms
        if diagnosis_data.symptom_ids:
            for symptom_id in diagnosis_data.symptom_ids:
                diagnosis_symptom = DiagnosisSymptom(
                    diagnosis_id=diagnosis.diagnosis_id,
                    symptom_id=symptom_id
                )
                db.add(diagnosis_symptom)
        
        await db.commit()

        # Re-fetch with relationships eagerly loaded
        diagnosis_id = diagnosis.diagnosis_id
        result = await db.execute(
            select(Diagnosis)
            .options(
                selectinload(Diagnosis.images),
                selectinload(Diagnosis.symptoms),
                selectinload(Diagnosis.final_disease)
            )
            .where(Diagnosis.diagnosis_id == diagnosis_id)
        )
        return result.scalar_one()
    
    @staticmethod
    async def update(
        db: AsyncSession,
        diagnosis_id: UUID,
        diagnosis_data: DiagnosisUpdate
    ) -> Diagnosis:
        """Update diagnosis"""
        diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
        
        # Update basic fields
        for field, value in diagnosis_data.dict(exclude_unset=True, exclude={'symptom_ids'}).items():
            setattr(diagnosis, field, value)
        
        # Update symptoms if provided
        if diagnosis_data.symptom_ids is not None:
            # Delete existing symptoms
            await db.execute(
                select(DiagnosisSymptom).where(
                    DiagnosisSymptom.diagnosis_id == diagnosis_id
                )
            )
            
            # Add new symptoms
            for symptom_id in diagnosis_data.symptom_ids:
                diagnosis_symptom = DiagnosisSymptom(
                    diagnosis_id=diagnosis_id,
                    symptom_id=symptom_id
                )
                db.add(diagnosis_symptom)
        
        diagnosis.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(diagnosis)
        
        return diagnosis
    
    @staticmethod
    async def delete(db: AsyncSession, diagnosis_id: UUID) -> None:
        """Delete diagnosis"""
        diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
        await db.delete(diagnosis)
        await db.commit()
    
    @staticmethod
    async def upload_image(
        db: AsyncSession,
        diagnosis_id: UUID,
        file: UploadFile
    ) -> DiagnosisImage:
        """Upload image for diagnosis"""
        # Verify diagnosis exists
        diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
        
        # Create upload directory if it doesn't exist
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{diagnosis_id}_{datetime.utcnow().timestamp()}{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create database record
        diagnosis_image = DiagnosisImage(
            diagnosis_id=diagnosis_id,
            image_url=f"/uploads/{filename}"
        )
        
        db.add(diagnosis_image)
        await db.commit()
        await db.refresh(diagnosis_image)
        
        return diagnosis_image