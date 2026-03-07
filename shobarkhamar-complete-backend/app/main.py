from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import init_db, close_db
from app.routers import auth, farms, diseases, diagnosis

# ── AI Model ──────────────────────────────────────────────────
try:
    from app.ai_model import DiseaseDetector
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/vgg16_disease_classifier.pth")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle"""
    # Database
    await init_db()

    # Upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # AI model — optional, graceful degradation if .pth not present
    if AI_AVAILABLE and os.path.exists(MODEL_PATH):
        try:
            app.state.ai_detector = DiseaseDetector(MODEL_PATH)
            print(f"✓ AI model loaded from: {MODEL_PATH}")
        except Exception as e:
            app.state.ai_detector = None
            print(f"⚠️  AI model failed to load: {e}")
    else:
        app.state.ai_detector = None
        print(f"⚠️  AI model not found at {MODEL_PATH} — running without AI inference")

    yield

    await close_db()


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="AI-powered disease detection system for fish and poultry farms",
    lifespan=lifespan
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
        "ai_model_loaded": app.state.ai_detector is not None,
        "model_path": MODEL_PATH if app.state.ai_detector is not None else None,
    }


@app.get(f"/api/{settings.API_VERSION}/about")
async def about():
    return {
        "project": settings.APP_NAME,
        "description": "AI-powered disease detection system for fish and poultry farms",
        "version": settings.API_VERSION,
        "ai_enabled": app.state.ai_detector is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)