from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.farm import FarmType, FarmStatus, UnitType
from app.models.disease import TargetSpecies


# Farm Unit Schemas
class FarmUnitBase(BaseModel):
    unit_type: UnitType
    unit_name: str = Field(..., min_length=1, max_length=100)
    target_species: TargetSpecies


class FarmUnitCreate(FarmUnitBase):
    farm_id: UUID


class FarmUnitUpdate(BaseModel):
    unit_type: Optional[UnitType] = None
    unit_name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_species: Optional[TargetSpecies] = None


class FarmUnitResponse(FarmUnitBase):
    unit_id: UUID
    farm_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Farm Schemas
class FarmBase(BaseModel):
    farm_name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = None
    area_size: Optional[float] = Field(None, gt=0)
    farm_type: FarmType


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    farm_name: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = None
    area_size: Optional[float] = Field(None, gt=0)
    farm_type: Optional[FarmType] = None
    farm_status: Optional[FarmStatus] = None


class FarmResponse(FarmBase):
    farm_id: UUID
    owner_id: UUID
    farm_status: FarmStatus
    created_at: datetime
    units: List[FarmUnitResponse] = []
    
    class Config:
        from_attributes = True


class FarmListResponse(BaseModel):
    farms: List[FarmResponse]
    total: int