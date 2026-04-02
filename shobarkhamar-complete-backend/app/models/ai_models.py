from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class LabelSource(str, enum.Enum):
    USER_CONFIRMED = "USER_CONFIRMED"
    VET_CONFIRMED = "VET_CONFIRMED"
    IMPORTED = "IMPORTED"


class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    model_version_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String, nullable=False)
    framework = Column(String)
    artifact_uri = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    predictions = relationship("Prediction", back_populates="model_version")
    
    def __repr__(self):
        return f"<ModelVersion(model_version_id={self.model_version_id}, name={self.model_name})>"


class Prediction(Base):
    __tablename__ = "predictions"
    
    prediction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagnosis_id = Column(UUID(as_uuid=True), ForeignKey("diagnoses.diagnosis_id"), nullable=False)
    diagnosis_image_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_images.diagnosis_image_id"), nullable=False)
    predicted_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.disease_id"), nullable=False)
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.model_version_id"), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    diagnosis = relationship("Diagnosis", back_populates="predictions")
    image = relationship("DiagnosisImage", back_populates="predictions")
    predicted_disease = relationship("Disease", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")
    
    def __repr__(self):
        return f"<Prediction(prediction_id={self.prediction_id}, confidence={self.confidence})>"


class AITrainingData(Base):
    __tablename__ = "ai_training_data"
    
    training_data_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagnosis_id = Column(UUID(as_uuid=True), ForeignKey("diagnoses.diagnosis_id"), nullable=False)
    diagnosis_image_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_images.diagnosis_image_id"), nullable=False)
    label_disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.disease_id"), nullable=False)
    label_source = Column(Enum(LabelSource), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    diagnosis = relationship("Diagnosis", back_populates="training_data")
    diagnosis_image = relationship("DiagnosisImage", back_populates="training_data")
    label_disease = relationship("Disease", back_populates="training_data")
    
    def __repr__(self):
        return f"<AITrainingData(training_data_id={self.training_data_id}, verified={self.is_verified})>"
