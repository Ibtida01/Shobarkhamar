from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.diagnosis import (
    DiagnosisCreate, DiagnosisUpdate, DiagnosisResponse,
    DiagnosisListResponse, ImageUploadResponse
)
from app.services.diagnosis_service import DiagnosisService

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.post("/analyze", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    diagnosis_data: DiagnosisCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new diagnosis for disease detection"""
    user_id = UUID(current_user["sub"])
    diagnosis = await DiagnosisService.create(db, user_id, diagnosis_data)
    return DiagnosisResponse.from_orm(diagnosis)


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    diagnosis_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get diagnosis by ID"""
    diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
    return DiagnosisResponse.from_orm(diagnosis)


@router.get("/history", response_model=DiagnosisListResponse)
async def get_diagnosis_history(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get diagnosis history for current user"""
    user_id = UUID(current_user["sub"])
    diagnoses = await DiagnosisService.get_by_user(db, user_id, skip, limit)
    
    return DiagnosisListResponse(
        diagnoses=[DiagnosisResponse.from_orm(d) for d in diagnoses],
        total=len(diagnoses)
    )


@router.put("/{diagnosis_id}", response_model=DiagnosisResponse)
async def update_diagnosis(
    diagnosis_id: UUID,
    diagnosis_data: DiagnosisUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update diagnosis"""
    diagnosis = await DiagnosisService.update(db, diagnosis_id, diagnosis_data)
    return DiagnosisResponse.from_orm(diagnosis)


@router.delete("/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis(
    diagnosis_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete diagnosis"""
    await DiagnosisService.delete(db, diagnosis_id)


@router.post("/{diagnosis_id}/images", response_model=ImageUploadResponse)
async def upload_diagnosis_image(
    diagnosis_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload image for diagnosis"""
    image = await DiagnosisService.upload_image(db, diagnosis_id, file)
    
    return ImageUploadResponse(
        diagnosis_image_id=image.diagnosis_image_id,
        image_url=image.image_url,
        diagnosis_id=image.diagnosis_id,
        captured_at=image.captured_at
    )