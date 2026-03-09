"""API routes for degradation prediction and health check."""

from io import BytesIO

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

from app.services.image_utils import ImageUtilsService

router = APIRouter()


@router.post("/predict")
async def predict(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = 0.5,
    material_override: str = "auto",
):
    """Accept an image upload and return material classification + degradation analysis.

    Args:
        request: FastAPI request (used to access app-level services).
        file: Uploaded image file.
        threshold: Binarization threshold for the segmentation mask (default 0.5).
        material_override: If not "auto", bypass AI classification and use this
                           material type directly. Options: auto, concrete, metal, wood.

    Returns:
        JSON response with material, confidence, severity, masks, and preprocessed image.
    """
    prediction_service = request.app.state.prediction_service

    img_bytes = await file.read()
    img = Image.open(BytesIO(img_bytes)).convert("RGB")

    result = prediction_service.predict(img, threshold, material_override=material_override)

    mask_b64 = ImageUtilsService.mask_to_base64(result["mask"])
    binary_b64 = ImageUtilsService.binary_mask_to_base64(result["binary"])

    # Return the original full-resolution image (mask is already full-res from tiling)
    preprocessed_b64 = ImageUtilsService.image_to_base64(img)

    return JSONResponse({
        "material": result["material"],
        "confidence": result["confidence"],
        "severity": result["severity"],
        "mask": mask_b64,
        "binary": binary_b64,
        "preprocessed_image": preprocessed_b64,
    })


@router.get("/")
async def home():
    """Health check endpoint."""
    return {"message": "DegradNet API is running ✅"}
