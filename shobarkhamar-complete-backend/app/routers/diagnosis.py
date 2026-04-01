from fastapi import APIRouter, Depends, status, UploadFile, File, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.diagnosis import (
    DiagnosisCreate, DiagnosisUpdate, DiagnosisResponse,
    DiagnosisListResponse, ImageUploadResponse, AIResultResponse
)
from app.services.diagnosis_service import DiagnosisService
import tempfile, os

router = APIRouter(prefix="/detection", tags=["Detection"])


# ── Existing CRUD endpoints (unchanged) ───────────────────────

@router.post("/analyze", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    diagnosis_data: DiagnosisCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = UUID(current_user["sub"])
    diagnosis = await DiagnosisService.create(db, user_id, diagnosis_data)
    return DiagnosisResponse.from_orm(diagnosis)


@router.get("/history", response_model=DiagnosisListResponse)
async def get_diagnosis_history(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = UUID(current_user["sub"])
    diagnoses = await DiagnosisService.get_by_user(db, user_id, skip, limit)
    return DiagnosisListResponse(
        diagnoses=[DiagnosisResponse.from_orm(d) for d in diagnoses],
        total=len(diagnoses)
    )


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    diagnosis_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
    return DiagnosisResponse.from_orm(diagnosis)


@router.put("/{diagnosis_id}", response_model=DiagnosisResponse)
async def update_diagnosis(
    diagnosis_id: UUID,
    diagnosis_data: DiagnosisUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    diagnosis = await DiagnosisService.update(db, diagnosis_id, diagnosis_data)
    return DiagnosisResponse.from_orm(diagnosis)


@router.delete("/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis(
    diagnosis_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await DiagnosisService.delete(db, diagnosis_id)


@router.post("/{diagnosis_id}/images", response_model=ImageUploadResponse)
async def upload_diagnosis_image(
    request: Request,
    diagnosis_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload image → runs AI inference automatically if model is loaded.
    Returns ImageUploadResponse which includes the full updated diagnosis
    with ai_result so the frontend gets everything in one call.
    """
    ai_detector = getattr(request.app.state, "ai_detector", None)
    image, ai_result = await DiagnosisService.upload_image(
        db, diagnosis_id, file, ai_detector=ai_detector
    )

    diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
    diagnosis_response = DiagnosisResponse.from_orm(diagnosis)

    if ai_result:
        diagnosis_response.ai_result = AIResultResponse(**ai_result)

    return ImageUploadResponse(
        diagnosis_image_id=image.diagnosis_image_id,
        image_url=image.image_url,
        diagnosis_id=image.diagnosis_id,
        captured_at=image.captured_at,
        diagnosis=diagnosis_response,
    )


# ── NEW: stateless quick-predict endpoints ────────────────────

async def _run_predict(detector, file: UploadFile, model_label: str) -> dict:
    """Save upload to temp file, run inference, clean up."""
    if detector is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{model_label} AI model is not loaded. Place the .pth file in /app/models/.",
        )

    suffix = os.path.splitext(file.filename or ".jpg")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        return detector.predict(tmp_path)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    finally:
        os.unlink(tmp_path)


@router.post(
    "/fish/predict",
    tags=["Detection"],
    summary="Fish disease quick-predict (stateless, no DB write)",
)
async def predict_fish_disease(
    request: Request,
    file: UploadFile = File(..., description="Fish image (jpg/png)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a fish image → returns AI prediction result immediately.
    Does **not** create a Diagnosis record. Use /analyze + /{id}/images for the full flow.
    """
    detector = getattr(request.app.state, "ai_detector", None)
    return await _run_predict(detector, file, "Fish")


@router.post(
    "/poultry/predict",
    tags=["Detection"],
    summary="Poultry disease quick-predict (stateless, no DB write)",
)
async def predict_poultry_disease(
    request: Request,
    file: UploadFile = File(..., description="Poultry image (jpg/png)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a poultry image → returns AI prediction result immediately.
    Does **not** create a Diagnosis record.
    """
    detector = getattr(request.app.state, "poultry_detector", None)
    return await _run_predict(detector, file, "Poultry")


@router.post("/{diagnosis_id}/images/fish", response_model=ImageUploadResponse)
async def upload_fish_image(
    request: Request,
    diagnosis_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ai_detector = getattr(request.app.state, "ai_detector", None)
    image, ai_result = await DiagnosisService.upload_image(
        db, diagnosis_id, file, ai_detector=ai_detector
    )
    diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
    diagnosis_response = DiagnosisResponse.from_orm(diagnosis)
    if ai_result:
        diagnosis_response.ai_result = AIResultResponse(**ai_result)
    return ImageUploadResponse(
        diagnosis_image_id=image.diagnosis_image_id,
        image_url=image.image_url,
        diagnosis_id=image.diagnosis_id,
        captured_at=image.captured_at,
        diagnosis=diagnosis_response,
    )


@router.post("/{diagnosis_id}/images/poultry", response_model=ImageUploadResponse)
async def upload_poultry_image(
    request: Request,
    diagnosis_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ai_detector = getattr(request.app.state, "poultry_detector", None)
    image, ai_result = await DiagnosisService.upload_image(
        db, diagnosis_id, file, ai_detector=ai_detector
    )
    diagnosis = await DiagnosisService.get_by_id(db, diagnosis_id)
    diagnosis_response = DiagnosisResponse.from_orm(diagnosis)
    if ai_result:
        diagnosis_response.ai_result = AIResultResponse(**ai_result)
    return ImageUploadResponse(
        diagnosis_image_id=image.diagnosis_image_id,
        image_url=image.image_url,
        diagnosis_id=image.diagnosis_id,
        captured_at=image.captured_at,
        diagnosis=diagnosis_response,
    )