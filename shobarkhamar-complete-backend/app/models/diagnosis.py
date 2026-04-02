import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.disease import TargetSpecies


class DiagnosisStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    diagnosis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.farm_id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), nullable=True)
    target_species = Column(Enum(TargetSpecies), nullable=False)
    status = Column(Enum(DiagnosisStatus), default=DiagnosisStatus.PENDING)
    symptoms_text = Column(Text, nullable=True)
    final_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.disease_id"), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_disease_code = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="diagnoses")
    farm = relationship("Farm", back_populates="diagnoses")
    final_disease = relationship("Disease", back_populates="diagnoses")
    images = relationship("DiagnosisImage", back_populates="diagnosis", lazy="select")
    symptoms = relationship("DiagnosisSymptom", back_populates="diagnosis", lazy="select")


class DiagnosisImage(Base):
    __tablename__ = "diagnosis_images"

    diagnosis_image_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagnosis_id = Column(UUID(as_uuid=True), ForeignKey("diagnoses.diagnosis_id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    captured_at = Column(DateTime, default=datetime.utcnow)

    diagnosis = relationship("Diagnosis", back_populates="images")


class DiagnosisSymptom(Base):
    __tablename__ = "diagnosis_symptoms"

    diagnosis_id = Column(UUID(as_uuid=True), ForeignKey("diagnoses.diagnosis_id"), primary_key=True)
    symptom_id = Column(UUID(as_uuid=True), ForeignKey("symptoms.symptom_id"), primary_key=True)

    diagnosis = relationship("Diagnosis", back_populates="symptoms")
