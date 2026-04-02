from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import init_db, close_db
from app.routers import auth, farms, diseases, diagnosis

# ── AI Models ─────────────────────────────────────────────────
try:
    from app.ai_model import DiseaseDetector
    FISH_AI_AVAILABLE = True
except ImportError:
    FISH_AI_AVAILABLE = False

try:
    from app.poultry_model import PoultryDiseaseDetector
    POULTRY_AI_AVAILABLE = True
except ImportError:
    POULTRY_AI_AVAILABLE = False

FISH_MODEL_PATH    = os.getenv("MODEL_PATH",         "/app/models/best_B4_wiener_False.pth")
POULTRY_MODEL_PATH = os.getenv("POULTRY_MODEL_PATH", "/app/models/efficientnetv2_b4_best.pth")


def _load_model(available, cls, path, label):
    if not available:
        print(f"⚠️  {label} module not importable — skipping")
        return None
    if not os.path.exists(path):
        print(f"⚠️  {label} model not found at {path} — running without AI inference")
        return None
    try:
        m = cls(path)
        print(f"✓ {label} model loaded from: {path}")
        return m
    except Exception as e:
        print(f"⚠️  {label} model failed to load: {e}")
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    app.state.ai_detector      = _load_model(FISH_AI_AVAILABLE,    DiseaseDetector,        FISH_MODEL_PATH,    "Fish")
    app.state.poultry_detector = _load_model(POULTRY_AI_AVAILABLE, PoultryDiseaseDetector, POULTRY_MODEL_PATH, "Poultry")

    yield

    await close_db()


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="AI-powered disease detection system for fish and poultry farms",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router,              prefix=f"/api/{settings.API_VERSION}")
app.include_router(farms.router,             prefix=f"/api/{settings.API_VERSION}")
app.include_router(diseases.router,          prefix=f"/api/{settings.API_VERSION}")
app.include_router(diseases.symptoms_router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(diagnosis.router,         prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    return {"message": "Welcome to Shobarkhamar API", "version": settings.API_VERSION, "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION,
        "fish_model_loaded":    getattr(app.state, "ai_detector", None) is not None,
        "poultry_model_loaded": getattr(app.state, "poultry_detector", None) is not None,
    }


@app.get(f"/api/{settings.API_VERSION}/about")
async def about():
    return {
        "project": settings.APP_NAME,
        "description": "AI-powered disease detection system for fish and poultry farms",
        "version": settings.API_VERSION,
        "fish_ai_enabled":    getattr(app.state, "ai_detector", None) is not None,
        "poultry_ai_enabled": getattr(app.state, "poultry_detector", None) is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)