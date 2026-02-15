from pydantic import BaseModel, Field, HttpUrl
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


class DiagnosisResponse(BaseModel):
    diagnosis_id: UUID
    user_id: UUID
    farm_id: UUID
    unit_id: Optional[UUID] = None
    target_species: TargetSpecies
    status: DiagnosisStatus
    symptoms_text: Optional[str] = None
    final_disease_id: Optional[UUID] = None
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