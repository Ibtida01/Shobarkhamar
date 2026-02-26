from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.schemas.disease import DiseaseResponse


class PredictionResponse(BaseModel):
    prediction_id: UUID
    diagnosis_id: UUID
    diagnosis_image_id: UUID
    predicted_disease_id: UUID
    confidence: Decimal
    created_at: datetime
    predicted_disease: DiseaseResponse
    
    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    predictions: List[PredictionResponse]
    total: int


class ModelVersionResponse(BaseModel):
    model_version_id: UUID
    model_name: str
    framework: Optional[str] = None
    artifact_uri: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class AITrainingDataCreate(BaseModel):
    diagnosis_id: UUID
    diagnosis_image_id: UUID
    label_disease_id: UUID
    label_source: str


class AITrainingDataResponse(BaseModel):
    training_data_id: UUID
    diagnosis_id: UUID
    diagnosis_image_id: UUID
    label_disease_id: UUID
    label_source: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True