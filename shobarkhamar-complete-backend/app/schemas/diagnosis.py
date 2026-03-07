from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.diagnosis import DiagnosisStatus, TargetSpecies
from app.schemas.disease import DiseaseResponse


class DiagnosisImageResponse(BaseModel):
    diagnosis_image_id: UUID
    image_url: str
    captured_at: datetime

    class Config:
        from_attributes = True


class DiagnosisCreate(BaseModel):
    farm_id: UUID
    unit_id: Optional[UUID] = None
    target_species: TargetSpecies
    symptoms_text: Optional[str] = None
    symptom_ids: List[UUID] = []


class DiagnosisUpdate(BaseModel):
    status: Optional[DiagnosisStatus] = None
    symptoms_text: Optional[str] = None
    final_disease_id: Optional[UUID] = None
    symptom_ids: Optional[List[UUID]] = None


# Inline AI result — returned directly in DiagnosisResponse so the
# frontend doesn't need a second request and doesn't depend on the
# diseases table being populated.
class AIResultResponse(BaseModel):
    disease_code: str
    disease_name: str
    confidence: float
    confidence_percent: float
    severity: str
    is_healthy: bool
    needs_treatment: bool


class DiagnosisResponse(BaseModel):
    diagnosis_id: UUID
    user_id: UUID
    farm_id: UUID
    unit_id: Optional[UUID] = None
    target_species: TargetSpecies
    status: DiagnosisStatus
    symptoms_text: Optional[str] = None
    final_disease_id: Optional[UUID] = None
    # AI inference result — populated after image upload
    ai_confidence: Optional[float] = None
    ai_disease_code: Optional[str] = None
    ai_result: Optional[AIResultResponse] = None   # full structured result
    created_at: datetime
    updated_at: datetime
    images: List[DiagnosisImageResponse] = []
    final_disease: Optional[DiseaseResponse] = None

    class Config:
        from_attributes = True


class DiagnosisListResponse(BaseModel):
    diagnoses: List[DiagnosisResponse]
    total: int


class ImageUploadRequest(BaseModel):
    diagnosis_id: UUID


class ImageUploadResponse(BaseModel):
    diagnosis_image_id: UUID
    image_url: str
    diagnosis_id: UUID
    captured_at: datetime
    # Full updated diagnosis so the frontend gets AI results immediately
    diagnosis: Optional[DiagnosisResponse] = None