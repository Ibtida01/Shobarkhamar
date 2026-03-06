from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from app.models.disease import SeverityLevel, TargetSpecies


# Symptom Schemas
class SymptomBase(BaseModel):
    symptom_name: str = Field(..., min_length=1, max_length=200)
    symptom_description: Optional[str] = None
    target_species: TargetSpecies


class SymptomCreate(SymptomBase):
    pass


class SymptomUpdate(BaseModel):
    symptom_name: Optional[str] = Field(None, min_length=1, max_length=200)
    symptom_description: Optional[str] = None
    target_species: Optional[TargetSpecies] = None


class SymptomResponse(SymptomBase):
    symptom_id: UUID
    
    class Config:
        from_attributes = True


# Disease Schemas
class DiseaseBase(BaseModel):
    disease_name: str = Field(..., min_length=1, max_length=200)
    target_species: TargetSpecies
    description: Optional[str] = None
    contagious: bool = False
    severity_level: SeverityLevel = SeverityLevel.MEDIUM


class DiseaseCreate(DiseaseBase):
    symptom_ids: List[UUID] = []


class DiseaseUpdate(BaseModel):
    disease_name: Optional[str] = Field(None, min_length=1, max_length=200)
    target_species: Optional[TargetSpecies] = None
    description: Optional[str] = None
    contagious: Optional[bool] = None
    severity_level: Optional[SeverityLevel] = None
    symptom_ids: Optional[List[UUID]] = None


class DiseaseResponse(DiseaseBase):
    disease_id: UUID
    symptoms: List[SymptomResponse] = []
    
    class Config:
        from_attributes = True


class DiseaseListResponse(BaseModel):
    diseases: List[DiseaseResponse]
    total: int