import uuid
import enum
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ApplicationMethod(str, enum.Enum):
    ORAL = "ORAL"
    INJECTION = "INJECTION"
    TOPICAL = "TOPICAL"
    WATER = "WATER"
    FEED = "FEED"
    OTHER = "OTHER"


class Treatment(Base):
    __tablename__ = "treatments"

    treatment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    treatment_name = Column(String(200), nullable=False)
    medication_name = Column(String(200), nullable=True)
    application_method = Column(Enum(ApplicationMethod), nullable=False)
    dosage_text = Column(Text, nullable=True)
    duration_days = Column(Integer, nullable=True)
    precaution = Column(Text, nullable=True)
    alternatives_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    disease_treatments = relationship("DiseaseTreatment", back_populates="treatment")


class DiseaseTreatment(Base):
    __tablename__ = "disease_treatments"

    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.disease_id"), primary_key=True)
    treatment_id = Column(UUID(as_uuid=True), ForeignKey("treatments.treatment_id"), primary_key=True)
    effectiveness_notes = Column(Text, nullable=True)
    is_primary_treatment = Column(Boolean, default=False)

    treatment = relationship("Treatment", back_populates="disease_treatments")
