from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import redis.asyncio as aioredis
import time

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token, create_refresh_token,
    decode_token, get_current_user, blacklist_token,
)
from app.schemas.user import UserCreate, UserLogin, UserUpdate, TokenResponse, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])

_redis = None

async def get_redis():
    global _redis
    if _redis is None:
        try:
            _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await _redis.ping()
        except Exception:
            _redis = None
    return _redis

async def check_rate_limit(redis, key, max_attempts=5, window=300):
    if redis is None:
        return
    try:
        current = await redis.get(key)
        if current and int(current) >= max_attempts:
            ttl = await redis.ttl(key)
            raise HTTPException(status_code=429, detail=f"Too many attempts. Try again in {ttl} seconds.")
        pipe = redis.pipeline()
        await pipe.incr(key)
        await pipe.expire(key, window)
        await pipe.execute()
    except HTTPException:
        raise
    except Exception:
        pass

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    redis = await get_redis()
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(redis, f"register:{ip}", 5, 300)
    user = await UserService.create(db, user_data)
    return TokenResponse(
        access_token=create_access_token({"sub": str(user.user_id), "role": user.role}),
        refresh_token=create_refresh_token({"sub": str(user.user_id)}),
        user=UserResponse.from_orm(user),
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    redis = await get_redis()
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(redis, f"login:{ip}", 10, 300)
    user = await UserService.authenticate(db, credentials.email, credentials.password)
    return TokenResponse(
        access_token=create_access_token({"sub": str(user.user_id), "role": user.role}),
        refresh_token=create_refresh_token({"sub": str(user.user_id)}),
        user=UserResponse.from_orm(user),
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: dict = Depends(get_current_user)):
    redis = await get_redis()
    jti = current_user.get("jti")
    exp = current_user.get("exp")
    if redis and jti and exp:
        ttl = max(int(exp - time.time()), 1)
        await blacklist_token(redis, jti, ttl)
    return {"message": "Logged out successfully"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing refresh token")
    token = auth.split(" ", 1)[1]
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")
    user = await UserService.get_by_id(db, UUID(payload["sub"]))
    return TokenResponse(
        access_token=create_access_token({"sub": str(user.user_id), "role": user.role}),
        refresh_token=create_refresh_token({"sub": str(user.user_id)}),
        user=UserResponse.from_orm(user),
    )

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return UserResponse.from_orm(await UserService.get_by_id(db, UUID(current_user["sub"])))

@router.put("/me", response_model=UserResponse)
async def update_profile(user_data: UserUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return UserResponse.from_orm(await UserService.update(db, UUID(current_user["sub"]), user_data))
