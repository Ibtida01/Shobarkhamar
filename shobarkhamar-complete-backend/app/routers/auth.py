from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import redis.asyncio as aioredis
import time

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token, create_refresh_token,
    decode_token, get_current_user, blacklist_token, is_token_blacklisted,
)
from app.schemas.user import UserCreate, UserLogin, UserUpdate, TokenResponse, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Redis client (optional — graceful fallback if unavailable) ─
_redis: aioredis.Redis | None = None

async def get_redis() -> aioredis.Redis | None:
    global _redis
    if _redis is None:
        try:
            _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await _redis.ping()
        except Exception:
            _redis = None
    return _redis


# ── Rate limiting helper ───────────────────────────────────────

async def check_rate_limit(redis: aioredis.Redis | None, key: str, max_attempts: int = 5, window: int = 300):
    """Allow max_attempts per window seconds. Raises 429 if exceeded."""
    if redis is None:
        return  # No Redis → skip rate limiting gracefully
    try:
        current = await redis.get(key)
        if current and int(current) >= max_attempts:
            ttl = await redis.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many attempts. Try again in {ttl} seconds.",
            )
        pipe = redis.pipeline()
        await pipe.incr(key)
        await pipe.expire(key, window)
        await pipe.execute()
    except HTTPException:
        raise
    except Exception:
        pass  # Redis error → don't block the user


# ── Endpoints ──────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user. Rate limited to 5 attempts per IP per 5 minutes."""
    redis = await get_redis()
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(redis, f"register:{ip}", max_attempts=5, window=300)

    user = await UserService.create(db, user_data)

    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.user_id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login. Rate limited to 10 attempts per IP per 5 minutes."""
    redis = await get_redis()
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(redis, f"login:{ip}", max_attempts=10, window=300)

    user = await UserService.authenticate(db, credentials.email, credentials.password)

    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.user_id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user),
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: dict = Depends(get_current_user),
):
    """
    Logout — blacklists the current access token in Redis so it cannot be reused.
    If Redis is unavailable, logout is still acknowledged (client deletes token).
    """
    redis = await get_redis()
    jti = current_user.get("jti")
    exp = current_user.get("exp")
    if redis and jti and exp:
        ttl = max(int(exp - time.time()), 1)
        await blacklist_token(redis, jti, ttl)
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a valid refresh token for a new access + refresh token pair.
    Send the refresh token in the Authorization header as Bearer.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    token = auth.split(" ", 1)[1]
    payload = decode_token(token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a refresh token")

    user_id = UUID(payload["sub"])
    user = await UserService.get_by_id(db, user_id)

    new_access = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    new_refresh = create_refresh_token(data={"sub": str(user.user_id)})

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user=UserResponse.from_orm(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current logged-in user's profile."""
    user_id = UUID(current_user["sub"])
    user = await UserService.get_by_id(db, user_id)
    return UserResponse.from_orm(user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current logged-in user's name, phone, and address."""
    user_id = UUID(current_user["sub"])
    user = await UserService.update(db, user_id, user_data)
    return UserResponse.from_orm(user)