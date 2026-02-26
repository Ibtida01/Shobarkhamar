"""
Pytest configuration and fixtures for testing.
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.models import User, Farm, Disease, Symptom
from app.core.security import hash_password

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    # Create async engine
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,
        echo=False,
    )
    
    # Create async session factory
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Provide session
    async with async_session() as session:
        yield session
    
    # Drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client."""
    
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(test_db: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hash_password("TestPass123!"),
        phone="+1234567890",
        role="FARMER"
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest.fixture
async def test_admin(test_db: AsyncSession) -> User:
    """Create a test admin user."""
    admin = User(
        name="Admin User",
        email="admin@example.com",
        password_hash=hash_password("AdminPass123!"),
        role="ADMIN"
    )
    test_db.add(admin)
    await test_db.commit()
    await test_db.refresh(admin)
    return admin


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    """Get authentication headers for test user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_headers(client: AsyncClient, test_admin: User) -> dict:
    """Get authentication headers for admin user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@example.com",
            "password": "AdminPass123!"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_farm(test_db: AsyncSession, test_user: User) -> Farm:
    """Create a test farm."""
    farm = Farm(
        owner_id=test_user.user_id,
        farm_name="Test Farm",
        farm_type="FISH",
        area_size=10.5,
        address="123 Test Street"
    )
    test_db.add(farm)
    await test_db.commit()
    await test_db.refresh(farm)
    return farm


@pytest.fixture
async def test_disease(test_db: AsyncSession) -> Disease:
    """Create a test disease."""
    disease = Disease(
        disease_name="White Spot Disease",
        target_species="FISH",
        description="Common fish disease",
        contagious=True,
        severity_level="HIGH"
    )
    test_db.add(disease)
    await test_db.commit()
    await test_db.refresh(disease)
    return disease


@pytest.fixture
async def test_symptom(test_db: AsyncSession) -> Symptom:
    """Create a test symptom."""
    symptom = Symptom(
        symptom_name="White spots on body",
        target_species="FISH",
        symptom_description="Visible white spots"
    )
    test_db.add(symptom)
    await test_db.commit()
    await test_db.refresh(symptom)
    return symptom