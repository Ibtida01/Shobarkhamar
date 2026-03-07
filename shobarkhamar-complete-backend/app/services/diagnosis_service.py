from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile
from uuid import UUID
from typing import List, Optional
import os
from datetime import datetime
from app.models.diagnosis import Diagnosis, DiagnosisSymptom, DiagnosisImage, DiagnosisStatus
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisUpdate
from app.core.config import settings


# Disease name mapping from VGG16 class codes
DISEASE_NAMES = {
    'cocci':   'Coccidiosis',
    'healthy': 'Healthy',
    'ncd':     'Newcastle Disease',
    'salmo':   'Salmonellosis',
}


def _build_ai_result(disease_code: str, confidence: float) -> dict:
    """Build a structured AI result dict from raw model output."""
    disease_name = DISEASE_NAMES.get(disease_code, disease_code.upper())
    is_healthy = disease_code == 'healthy'

    if is_healthy:
        severity = 'NONE'
    elif confidence >= 0.8:
        severity = 'CRITICAL' if disease_code in ('ncd', 'salmo') else 'HIGH'
    elif confidence >= 0.6:
        severity = 'MEDIUM'
    else:
        severity = 'LOW'

    return {
        'disease_code':       disease_code,
        'disease_name':       disease_name,
        'confidence':         confidence,
        'confidence_percent': round(confidence * 100, 2),
        'severity':           severity,
        'is_healthy':         is_healthy,
        'needs_treatment':    not is_healthy and confidence > 0.5,
    }


class DiagnosisService:

    @staticmethod
    async def _fetch_full(db: AsyncSession, diagnosis_id: UUID) -> Diagnosis:
        result = await db.execute(
            select(Diagnosis)
            .options(
                selectinload(Diagnosis.images),
                selectinload(Diagnosis.symptoms),
                selectinload(Diagnosis.final_disease),
            )
            .where(Diagnosis.diagnosis_id == diagnosis_id)
        )
        diagnosis = result.scalar_one_or_none()
        if not diagnosis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found")
        return diagnosis

    @staticmethod
    async def get_by_id(db: AsyncSession, diagnosis_id: UUID) -> Diagnosis:
        return await DiagnosisService._fetch_full(db, diagnosis_id)

    @staticmethod
    async def get_by_user(db, user_id: UUID, skip=0, limit=100) -> List[Diagnosis]:
        result = await db.execute(
            select(Diagnosis)
            .options(selectinload(Diagnosis.images), selectinload(Diagnosis.final_disease))
            .where(Diagnosis.user_id == user_id)
            .offset(skip).limit(limit)
            .order_by(Diagnosis.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def create(db: AsyncSession, user_id: UUID, diagnosis_data: DiagnosisCreate) -> Diagnosis:
        diagnosis = Diagnosis(
            user_id=user_id,
            farm_id=diagnosis_data.farm_id,
            unit_id=diagnosis_data.unit_id,
            target_species=diagnosis_data.target_species,
            symptoms_text=diagnosis_data.symptoms_text,
            status=DiagnosisStatus.PENDING,
        )
        db.add(diagnosis)
        await db.flush()

        for symptom_id in (diagnosis_data.symptom_ids or []):
            db.add(DiagnosisSymptom(diagnosis_id=diagnosis.diagnosis_id, symptom_id=symptom_id))

        await db.commit()
        return await DiagnosisService._fetch_full(db, diagnosis.diagnosis_id)

    @staticmethod
    async def update(db: AsyncSession, diagnosis_id: UUID, diagnosis_data: DiagnosisUpdate) -> Diagnosis:
        diagnosis = await DiagnosisService._fetch_full(db, diagnosis_id)
        for field, value in diagnosis_data.dict(exclude_unset=True, exclude={'symptom_ids'}).items():
            setattr(diagnosis, field, value)
        if diagnosis_data.symptom_ids is not None:
            for sid in diagnosis_data.symptom_ids:
                db.add(DiagnosisSymptom(diagnosis_id=diagnosis_id, symptom_id=sid))
        diagnosis.updated_at = datetime.utcnow()
        await db.commit()
        return await DiagnosisService._fetch_full(db, diagnosis_id)

    @staticmethod
    async def delete(db: AsyncSession, diagnosis_id: UUID) -> None:
        diagnosis = await DiagnosisService._fetch_full(db, diagnosis_id)
        await db.delete(diagnosis)
        await db.commit()

    @staticmethod
    async def upload_image(
        db: AsyncSession,
        diagnosis_id: UUID,
        file: UploadFile,
        ai_detector=None,
    ):
        """
        1. Save image to disk
        2. Run AI inference if model is loaded
        3. Store ai_disease_code + ai_confidence on the Diagnosis row
        4. Return (DiagnosisImage, ai_result_dict | None)
        """
        await DiagnosisService._fetch_full(db, diagnosis_id)  # verify exists

        # Save file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename or 'img.jpg')[1] or '.jpg'
        filename = f"{diagnosis_id}_{datetime.utcnow().timestamp()}{ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        with open(file_path, 'wb') as buf:
            buf.write(await file.read())

        # Image record
        diagnosis_image = DiagnosisImage(
            diagnosis_id=diagnosis_id,
            image_url=f'/uploads/{filename}',
        )
        db.add(diagnosis_image)

        # Re-fetch for update
        result = await db.execute(select(Diagnosis).where(Diagnosis.diagnosis_id == diagnosis_id))
        diagnosis = result.scalar_one()

        ai_result = None

        if ai_detector is not None:
            try:
                diagnosis.status = DiagnosisStatus.PROCESSING
                await db.flush()

                prediction = ai_detector.predict(file_path)
                primary = prediction['primary_prediction']

                diagnosis.ai_confidence  = primary['confidence']
                diagnosis.ai_disease_code = primary['disease_code']
                diagnosis.status = DiagnosisStatus.COMPLETED
                ai_result = _build_ai_result(primary['disease_code'], primary['confidence'])

                print(f"✓ AI: {primary['disease_name']} ({primary['confidence_percent']}%)")
            except Exception as e:
                diagnosis.status = DiagnosisStatus.FAILED
                print(f"⚠️  AI inference error: {e}")
        else:
            diagnosis.status = DiagnosisStatus.COMPLETED

        diagnosis.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(diagnosis_image)

        return diagnosis_image, ai_result