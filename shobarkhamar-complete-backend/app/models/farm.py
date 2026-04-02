import uuid
import enum
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class FarmType(str, enum.Enum):
    FISH = "FISH"
    POULTRY = "POULTRY"
    MIXED = "MIXED"


class FarmStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class UnitType(str, enum.Enum):
    POND = "POND"
    CAGE = "CAGE"
    TANK = "TANK"
    COOP = "COOP"
    PEN = "PEN"
    OTHER = "OTHER"


class Farm(Base):
    __tablename__ = "farms"

    farm_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    farm_name = Column(String(200), nullable=False)
    farm_type = Column(Enum(FarmType), nullable=False)
    farm_status = Column(Enum(FarmStatus), default=FarmStatus.ACTIVE)
    address = Column(String(500), nullable=True)
    area_size = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    units = relationship("FarmUnit", back_populates="farm", lazy="select")
    diagnoses = relationship("Diagnosis", back_populates="farm", lazy="select")


class FarmUnit(Base):
    __tablename__ = "farm_units"

    unit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.farm_id"), nullable=False)
    unit_type = Column(Enum(UnitType), nullable=False)
    unit_name = Column(String(100), nullable=False)
    target_species = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="units")
