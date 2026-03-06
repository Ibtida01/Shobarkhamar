from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import init_db, close_db
from app.routers import auth, farms, diseases, diagnosis


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    await init_db()
    
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    yield
    
    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="API for detecting and managing fish and poultry diseases using AI-powered image analysis",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for uploaded images)
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(farms.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(diseases.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(diseases.symptoms_router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(diagnosis.router, prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Shobarkhamar API",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION
    }


@app.get(f"/api/{settings.API_VERSION}/about")
async def about():
    """Get project information"""
    return {
        "project": settings.APP_NAME,
        "description": "AI-powered disease detection system for fish and poultry farms",
        "version": settings.API_VERSION,
        "features": [
            "AI-powered disease detection from images",
            "Comprehensive disease database",
            "Treatment recommendations",
            "Farm management",
            "Notification system"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )