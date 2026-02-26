from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType


# Notification Schemas
class NotificationBase(BaseModel):
    diagnosis_id: Optional[UUID] = None
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)


class NotificationCreate(NotificationBase):
    user_id: UUID
    scheduled_at: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    is_read: bool


class NotificationResponse(NotificationBase):
    notification_id: UUID
    user_id: UUID
    is_read: bool
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


# Feedback Schemas
class FeedbackCreate(BaseModel):
    feedback_text: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)


class FeedbackResponse(BaseModel):
    feedback_id: UUID
    user_id: UUID
    feedback_text: str
    rating: int
    feedback_date: datetime
    
    class Config:
        from_attributes = True


class FeedbackListResponse(BaseModel):
    feedbacks: List[FeedbackResponse]
    total: int
    average_rating: float