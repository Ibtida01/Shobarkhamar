from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.disease import (
    DiseaseCreate, DiseaseUpdate, DiseaseResponse, DiseaseListResponse,
    SymptomCreate, SymptomUpdate, SymptomResponse
)
from app.services.disease_service import DiseaseService, SymptomService

router = APIRouter(prefix="/diseases", tags=["Disease Database"])


@router.get("", response_model=DiseaseListResponse)
async def get_diseases(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all diseases"""
    diseases = await DiseaseService.get_all(db, skip, limit)
    
    return DiseaseListResponse(
        diseases=[DiseaseResponse.from_orm(disease) for disease in diseases],
        total=len(diseases)
    )


@router.get("/{disease_id}", response_model=DiseaseResponse)
async def get_disease(
    disease_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get disease by ID"""
    disease = await DiseaseService.get_by_id(db, disease_id)
    return DiseaseResponse.from_orm(disease)


@router.post("", response_model=DiseaseResponse, status_code=status.HTTP_201_CREATED)
async def create_disease(
    disease_data: DiseaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create new disease (Admin only)"""
    disease = await DiseaseService.create(db, disease_data)
    return DiseaseResponse.from_orm(disease)


@router.put("/{disease_id}", response_model=DiseaseResponse)
async def update_disease(
    disease_id: UUID,
    disease_data: DiseaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update disease (Admin only)"""
    disease = await DiseaseService.update(db, disease_id, disease_data)
    return DiseaseResponse.from_orm(disease)


@router.delete("/{disease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_disease(
    disease_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete disease (Admin only)"""
    await DiseaseService.delete(db, disease_id)


# Symptom endpoints
symptoms_router = APIRouter(prefix="/symptoms", tags=["Disease Database"])


@symptoms_router.get("", response_model=list[SymptomResponse])
async def get_symptoms(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all symptoms"""
    symptoms = await SymptomService.get_all(db, skip, limit)
    return [SymptomResponse.from_orm(symptom) for symptom in symptoms]


@symptoms_router.get("/{symptom_id}", response_model=SymptomResponse)
async def get_symptom(
    symptom_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get symptom by ID"""
    symptom = await SymptomService.get_by_id(db, symptom_id)
    return SymptomResponse.from_orm(symptom)


@symptoms_router.post("", response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    symptom_data: SymptomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create new symptom (Admin only)"""
    symptom = await SymptomService.create(db, symptom_data)
    return SymptomResponse.from_orm(symptom)


@symptoms_router.put("/{symptom_id}", response_model=SymptomResponse)
async def update_symptom(
    symptom_id: UUID,
    symptom_data: SymptomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update symptom (Admin only)"""
    symptom = await SymptomService.update(db, symptom_id, symptom_data)
    return SymptomResponse.from_orm(symptom)


@symptoms_router.delete("/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom(
    symptom_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete symptom (Admin only)"""
    await SymptomService.delete(db, symptom_id)