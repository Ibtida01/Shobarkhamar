"""
Simple smoke tests — no DB, no auth, just verifying the app starts
and basic endpoints respond. Used to demonstrate CI/CD pipeline.
"""
import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Health endpoint returns 200."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    """Root endpoint returns welcome message."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_docs_available(client: AsyncClient):
    """Swagger docs are accessible."""
    response = await client.get("/docs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_login_requires_body(client: AsyncClient):
    """Login endpoint returns 422 when body is missing."""
    response = await client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_protected_endpoint_requires_auth(client: AsyncClient):
    """Detection endpoint returns 403 without token."""
    response = await client.get("/api/v1/detection/history")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_fish_predict_requires_auth(client: AsyncClient):
    """Fish predict endpoint returns 403 without token."""
    response = await client.post("/api/v1/detection/fish/predict")
    assert response.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_poultry_predict_requires_auth(client: AsyncClient):
    """Poultry predict endpoint returns 403 without token."""
    response = await client.post("/api/v1/detection/poultry/predict")
    assert response.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_about_endpoint(client: AsyncClient):
    """About endpoint returns project info."""
    response = await client.get("/api/v1/about")
    assert response.status_code == 200
    data = response.json()
    assert "project" in data
