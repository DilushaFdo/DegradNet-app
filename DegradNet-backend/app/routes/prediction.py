"""Routes for prediction and health check."""

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
    """Takes an image, runs prediction models, and returns the results."""
    prediction_service = request.app.state.prediction_service

    img_bytes = await file.read()
    img = Image.open(BytesIO(img_bytes)).convert("RGB")

    result = prediction_service.predict(img, threshold, material_override=material_override)

    mask_b64 = ImageUtilsService.mask_to_base64(result["mask"], img)
    raw_mask_b64 = ImageUtilsService.probability_mask_to_base64(result["mask"])
    surface_data = ImageUtilsService.mask_to_surface_data(result["mask"])
    binary_b64 = ImageUtilsService.binary_mask_to_base64(result["binary"])

    # Return the original full-resolution image (mask is already full-res from tiling)
    preprocessed_b64 = ImageUtilsService.image_to_base64(img)

    return JSONResponse({
        "material": result["material"],
        "confidence": result["confidence"],
        "severity": result["severity"],
        "raw_mask": raw_mask_b64,
        "mask": mask_b64,
        "surface_data": surface_data,
        "binary": binary_b64,
        "preprocessed_image": preprocessed_b64,
    })


@router.get("/")
async def home():
    """Simple health check endpoint."""
    return {"message": "DegradNet API is running ✅"}
