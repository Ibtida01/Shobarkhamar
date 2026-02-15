from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from app.models.treatment import ApplicationMethod


class TreatmentBase(BaseModel):
    treatment_name: str = Field(..., min_length=1, max_length=200)
    medication_name: Optional[str] = None
    application_method: ApplicationMethod
    dosage_text: Optional[str] = None
    duration_days: Optional[int] = Field(None, ge=1)
    precaution: Optional[str] = None
    alternatives_note: Optional[str] = None


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentUpdate(BaseModel):
    treatment_name: Optional[str] = Field(None, min_length=1, max_length=200)
    medication_name: Optional[str] = None
    application_method: Optional[ApplicationMethod] = None
    dosage_text: Optional[str] = None
    duration_days: Optional[int] = Field(None, ge=1)
    precaution: Optional[str] = None
    alternatives_note: Optional[str] = None


class TreatmentResponse(TreatmentBase):
    treatment_id: UUID
    
    class Config:
        from_attributes = True


class DiseaseTreatmentCreate(BaseModel):
    disease_id: UUID
    treatment_id: UUID
    effectiveness_notes: Optional[str] = None
    is_primary_treatment: bool = False


class DiseaseTreatmentResponse(BaseModel):
    disease_id: UUID
    treatment_id: UUID
    effectiveness_notes: Optional[str] = None
    is_primary_treatment: bool
    treatment: TreatmentResponse
    
    class Config:
        from_attributes = True


class TreatmentListResponse(BaseModel):
    treatments: List[TreatmentResponse]
    total: int