from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.farm import (
    FarmCreate, FarmUpdate, FarmResponse, FarmListResponse,
    FarmUnitCreate, FarmUnitUpdate, FarmUnitResponse
)
from app.services.farm_service import FarmService, FarmUnitService

router = APIRouter(prefix="/farms", tags=["Farms"])


@router.get("", response_model=FarmListResponse)
async def get_farms(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all farms for current user"""
    user_id = UUID(current_user["sub"])
    farms = await FarmService.get_by_owner(db, user_id)
    
    return FarmListResponse(
        farms=[FarmResponse.from_orm(farm) for farm in farms],
        total=len(farms)
    )


@router.get("/{farm_id}", response_model=FarmResponse)
async def get_farm(
    farm_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get farm by ID"""
    farm = await FarmService.get_by_id(db, farm_id)
    return FarmResponse.from_orm(farm)


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_data: FarmCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new farm"""
    user_id = UUID(current_user["sub"])
    farm = await FarmService.create(db, user_id, farm_data)
    return FarmResponse.from_orm(farm)


@router.put("/{farm_id}", response_model=FarmResponse)
async def update_farm(
    farm_id: UUID,
    farm_data: FarmUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update farm"""
    farm = await FarmService.update(db, farm_id, farm_data)
    return FarmResponse.from_orm(farm)


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(
    farm_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete farm"""
    await FarmService.delete(db, farm_id)


# Farm Unit endpoints
@router.post("/units", response_model=FarmUnitResponse, status_code=status.HTTP_201_CREATED)
async def create_farm_unit(
    unit_data: FarmUnitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new farm unit"""
    unit = await FarmUnitService.create(db, unit_data)
    return FarmUnitResponse.from_orm(unit)


@router.put("/units/{unit_id}", response_model=FarmUnitResponse)
async def update_farm_unit(
    unit_id: UUID,
    unit_data: FarmUnitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update farm unit"""
    unit = await FarmUnitService.update(db, unit_id, unit_data)
    return FarmUnitResponse.from_orm(unit)


@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm_unit(
    unit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete farm unit"""
    await FarmUnitService.delete(db, unit_id)