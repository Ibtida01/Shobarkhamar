from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


class UserService:
    """Service for user-related operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> User:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        """Get user by email"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create(db: AsyncSession, user_data: UserCreate) -> User:
        """Create new user"""
        # Check if email already exists
        existing_user = await UserService.get_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            address=user_data.address,
            password_hash=hash_password(user_data.password)
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def update(db: AsyncSession, user_id: UUID, user_data: UserUpdate) -> User:
        """Update user"""
        user = await UserService.get_by_id(db, user_id)
        
        # Update fields
        for field, value in user_data.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def delete(db: AsyncSession, user_id: UUID) -> None:
        """Delete user"""
        user = await UserService.get_by_id(db, user_id)
        await db.delete(user)
        await db.commit()
    
    @staticmethod
    async def authenticate(db: AsyncSession, email: str, password: str) -> User:
        """Authenticate user"""
        user = await UserService.get_by_email(db, email)
        
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        return user