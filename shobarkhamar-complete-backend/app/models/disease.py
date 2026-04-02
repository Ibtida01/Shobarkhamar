import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TargetSpecies(str, enum.Enum):
    FISH = "FISH"
    POULTRY = "POULTRY"
    MIXED = "MIXED"


# Association table for disease <-> symptom
disease_symptoms = Table(
    "disease_symptoms",
    Base.metadata,
    Column("disease_id", UUID(as_uuid=True), ForeignKey("diseases.disease_id"), primary_key=True),
    Column("symptom_id", UUID(as_uuid=True), ForeignKey("symptoms.symptom_id"), primary_key=True),
)


class Symptom(Base):
    __tablename__ = "symptoms"

    symptom_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symptom_name = Column(String(200), nullable=False)
    symptom_description = Column(Text, nullable=True)
    target_species = Column(Enum(TargetSpecies), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    diseases = relationship("Disease", secondary=disease_symptoms, back_populates="symptoms")


class Disease(Base):
    __tablename__ = "diseases"

    disease_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disease_name = Column(String(200), nullable=False)
    target_species = Column(Enum(TargetSpecies), nullable=False)
    description = Column(Text, nullable=True)
    contagious = Column(Boolean, default=False)
    severity_level = Column(Enum(SeverityLevel), default=SeverityLevel.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    symptoms = relationship("Symptom", secondary=disease_symptoms, back_populates="diseases")
    diagnoses = relationship("Diagnosis", back_populates="final_disease", lazy="select")
