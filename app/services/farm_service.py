from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from typing import List
from app.models.farm import Farm, FarmUnit
from app.schemas.farm import FarmCreate, FarmUpdate, FarmUnitCreate, FarmUnitUpdate


class FarmService:
    """Service for farm-related operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, farm_id: UUID) -> Farm:
        """Get farm by ID"""
        result = await db.execute(
            select(Farm)
            .options(selectinload(Farm.units))
            .where(Farm.farm_id == farm_id)
        )
        farm = result.scalar_one_or_none()
        
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        return farm
    
    @staticmethod
    async def get_by_owner(db: AsyncSession, owner_id: UUID) -> List[Farm]:
        """Get all farms by owner"""
        result = await db.execute(
            select(Farm)
            .options(selectinload(Farm.units))
            .where(Farm.owner_id == owner_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def create(db: AsyncSession, owner_id: UUID, farm_data: FarmCreate) -> Farm:
        """Create new farm"""
        farm = Farm(
            owner_id=owner_id,
            **farm_data.dict()
        )
        
        db.add(farm)
        await db.commit()
        await db.refresh(farm)
        
        return farm
    
    @staticmethod
    async def update(db: AsyncSession, farm_id: UUID, farm_data: FarmUpdate) -> Farm:
        """Update farm"""
        farm = await FarmService.get_by_id(db, farm_id)
        
        for field, value in farm_data.dict(exclude_unset=True).items():
            setattr(farm, field, value)
        
        await db.commit()
        await db.refresh(farm)
        
        return farm
    
    @staticmethod
    async def delete(db: AsyncSession, farm_id: UUID) -> None:
        """Delete farm"""
        farm = await FarmService.get_by_id(db, farm_id)
        await db.delete(farm)
        await db.commit()


class FarmUnitService:
    """Service for farm unit operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, unit_id: UUID) -> FarmUnit:
        """Get farm unit by ID"""
        result = await db.execute(select(FarmUnit).where(FarmUnit.unit_id == unit_id))
        unit = result.scalar_one_or_none()
        
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm unit not found"
            )
        
        return unit
    
    @staticmethod
    async def create(db: AsyncSession, unit_data: FarmUnitCreate) -> FarmUnit:
        """Create new farm unit"""
        unit = FarmUnit(**unit_data.dict())
        
        db.add(unit)
        await db.commit()
        await db.refresh(unit)
        
        return unit
    
    @staticmethod
    async def update(db: AsyncSession, unit_id: UUID, unit_data: FarmUnitUpdate) -> FarmUnit:
        """Update farm unit"""
        unit = await FarmUnitService.get_by_id(db, unit_id)
        
        for field, value in unit_data.dict(exclude_unset=True).items():
            setattr(unit, field, value)
        
        await db.commit()
        await db.refresh(unit)
        
        return unit
    
    @staticmethod
    async def delete(db: AsyncSession, unit_id: UUID) -> None:
        """Delete farm unit"""
        unit = await FarmUnitService.get_by_id(db, unit_id)
        await db.delete(unit)
        await db.commit()