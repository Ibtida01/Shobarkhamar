import uuid
import enum
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class NotificationType(str, enum.Enum):
    DIAGNOSIS_COMPLETE = "DIAGNOSIS_COMPLETE"
    DISEASE_ALERT = "DISEASE_ALERT"
    TREATMENT_REMINDER = "TREATMENT_REMINDER"
    SYSTEM = "SYSTEM"
    OTHER = "OTHER"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    diagnosis_id = Column(UUID(as_uuid=True), ForeignKey("diagnoses.diagnosis_id"), nullable=True)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)
    feedback_date = Column(DateTime, default=datetime.utcnow)
