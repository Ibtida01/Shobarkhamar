"""
Shobarkhamar Pipeline - Standalone Mode with Real AI Model Integration
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
import uuid
import os
import tempfile
from pathlib import Path

# Import AI model
try:
    from app.ai_model import DiseaseDetector
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️  AI model not available, using mock predictions")

app = FastAPI(
    title="Shobarkhamar Data Pipeline - AI Integrated",
    description="Production version with real VGG16 disease detection",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database
users_db = {}
diagnoses_db = {}

# Initialize AI model (if available)
ai_detector = None
MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/vgg16_disease_classifier.pth")

if AI_AVAILABLE and os.path.exists(MODEL_PATH):
    try:
        ai_detector = DiseaseDetector(MODEL_PATH)
        print(f"✓ AI Model loaded from: {MODEL_PATH}")
    except Exception as e:
        print(f"⚠️  Failed to load AI model: {e}")
        ai_detector = None
else:
    print(f"⚠️  Model not found at: {MODEL_PATH}")
    print("    Using mock predictions for testing")


@app.post("/auth/register")
async def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: Optional[str] = Form(None),
    address: Optional[str] = Form(None)
):
    """Register a new user"""
    if email in users_db:
        raise HTTPException(status_code=409, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    access_token = f"mock_token_{user_id}"
    
    users_db[email] = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "name": name,
            "email": email,
            "access_token": access_token,
            "token_type": "bearer"
        }
    }


@app.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    """Login user"""
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[email]
    return {
        "status": "success",
        "data": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "access_token": f"mock_token_{user['user_id']}",
            "token_type": "bearer"
        }
    }


@app.post("/diagnosis")
async def create_diagnosis(
    image: UploadFile = File(...),
    farm_id: Optional[str] = Form(None),
    target_species: str = Form(...),
    symptoms_text: Optional[str] = Form(None),
    authorization: Optional[str] = None
):
    """
    Create disease diagnosis using AI model
    
    This endpoint:
    1. Saves uploaded image temporarily
    2. Runs AI inference (if model available)
    3. Returns prediction with confidence scores
    """
    diagnosis_id = str(uuid.uuid4())
    
    # Save image temporarily for AI processing
    temp_dir = tempfile.gettempdir()
    temp_image_path = os.path.join(temp_dir, f"{diagnosis_id}_{image.filename}")
    
    try:
        # Save uploaded image
        contents = await image.read()
        with open(temp_image_path, "wb") as f:
            f.write(contents)
        
        # Run AI prediction
        if ai_detector is not None:
            # Real AI prediction
            ai_result = ai_detector.predict(temp_image_path, top_k=3)
            
            primary_pred = ai_result['primary_prediction']
            
            # Format disease info
            disease_info = {
                "disease_id": str(uuid.uuid4()),
                "disease_name": primary_pred['disease_name'],
                "disease_code": primary_pred['disease_code'],
                "confidence": primary_pred['confidence'],
                "confidence_percent": primary_pred['confidence_percent'],
                "severity": primary_pred['severity']
            }
            
            # Format alternative predictions
            alternative_diseases = [
                {
                    "disease_id": str(uuid.uuid4()),
                    "disease_name": pred['disease_name'],
                    "confidence": pred['confidence'],
                    "confidence_percent": pred['confidence_percent']
                }
                for pred in ai_result['all_predictions'][1:3]
            ]
            
            # Treatment recommendations (based on disease)
            treatments = get_treatment_recommendations(primary_pred['disease_code'])
            
            status = "COMPLETED"
            ai_powered = True
            
        else:
            # Mock prediction (for testing without model)
            disease_info = {
                "disease_id": str(uuid.uuid4()),
                "disease_name": "Newcastle Disease" if target_species.upper() == "POULTRY" else "White Spot Disease",
                "disease_code": "ncd" if target_species.upper() == "POULTRY" else "ich",
                "confidence": 0.85,
                "confidence_percent": 85.0,
                "severity": "HIGH"
            }
            
            alternative_diseases = []
            treatments = [{"treatment_id": str(uuid.uuid4()), "treatment_name": "Mock Treatment"}]
            status = "COMPLETED"
            ai_powered = False
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
    
    finally:
        # Cleanup temporary file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)
    
    # Create diagnosis record
    diagnosis = {
        "diagnosis_id": diagnosis_id,
        "target_species": target_species.upper(),
        "status": status,
        "prediction": disease_info,
        "alternative_predictions": alternative_diseases,
        "treatments": treatments,
        "symptoms_text": symptoms_text,
        "ai_powered": ai_powered,
        "created_at": datetime.now().isoformat()
    }
    
    diagnoses_db[diagnosis_id] = diagnosis
    
    return {
        "status": "success",
        "data": diagnosis
    }


def get_treatment_recommendations(disease_code: str) -> list:
    """Get treatment recommendations based on disease"""
    treatments = {
        'cocci': [
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Amprolium",
                "dosage_text": "10 mg/kg body weight for 5-7 days",
                "administration": "Mix with drinking water"
            },
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Sulfadimethoxine",
                "dosage_text": "50 mg/kg on day 1, then 25 mg/kg for 4-5 days",
                "administration": "Oral or water"
            }
        ],
        'ncd': [
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Supportive Care",
                "dosage_text": "No specific cure - prevent with vaccination",
                "administration": "Isolate infected birds immediately"
            },
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Newcastle Vaccine (LaSota)",
                "dosage_text": "Preventive vaccination recommended",
                "administration": "Eye drop or drinking water"
            }
        ],
        'salmo': [
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Enrofloxacin",
                "dosage_text": "10 mg/kg body weight twice daily for 7-10 days",
                "administration": "Oral or injectable"
            },
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "Hygiene Improvement",
                "dosage_text": "Clean water and feed, sanitize equipment",
                "administration": "Environmental management"
            }
        ],
        'healthy': [
            {
                "treatment_id": str(uuid.uuid4()),
                "treatment_name": "No Treatment Required",
                "dosage_text": "Continue regular health monitoring",
                "administration": "Maintain current care practices"
            }
        ]
    }
    
    return treatments.get(disease_code, [
        {
            "treatment_id": str(uuid.uuid4()),
            "treatment_name": "Consult Veterinarian",
            "dosage_text": "Professional diagnosis recommended",
            "administration": "Schedule vet visit"
        }
    ])


@app.get("/diagnosis/{diagnosis_id}")
async def get_diagnosis(diagnosis_id: str, authorization: Optional[str] = None):
    """Get diagnosis details"""
    if diagnosis_id not in diagnoses_db:
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "success", "data": diagnoses_db[diagnosis_id]}


@app.get("/diagnosis")
async def list_diagnoses(
    page: int = 1,
    limit: int = 20,
    authorization: Optional[str] = None
):
    """List all diagnoses"""
    all_diagnoses = list(diagnoses_db.values())
    
    return {
        "status": "success",
        "data": {
            "diagnoses": all_diagnoses,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_pages": 1,
                "total_items": len(all_diagnoses)
            }
        }
    }


@app.get("/diseases")
async def list_diseases(target_species: Optional[str] = None):
    """List diseases in database"""
    diseases = [
        {
            "disease_id": str(uuid.uuid4()),
            "disease_code": "cocci",
            "disease_name": "Coccidiosis",
            "target_species": "POULTRY",
            "description": "Parasitic disease affecting intestinal tract"
        },
        {
            "disease_id": str(uuid.uuid4()),
            "disease_code": "ncd",
            "disease_name": "Newcastle Disease",
            "target_species": "POULTRY",
            "description": "Highly contagious viral disease"
        },
        {
            "disease_id": str(uuid.uuid4()),
            "disease_code": "salmo",
            "disease_name": "Salmonellosis",
            "target_species": "POULTRY",
            "description": "Bacterial infection causing diarrhea"
        }
    ]
    
    if target_species:
        diseases = [d for d in diseases if d["target_species"] == target_species.upper()]
    
    return {
        "status": "success",
        "data": {"diseases": diseases}
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "shobarkhamar-pipeline-ai-integrated",
        "version": "2.0.0",
        "mode": "standalone-with-ai" if ai_detector else "standalone-mock",
        "ai_model_loaded": ai_detector is not None,
        "model_path": MODEL_PATH if ai_detector else None,
        "users": len(users_db),
        "diagnoses": len(diagnoses_db)
    }
