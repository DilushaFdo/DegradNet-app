"""DegradNet application factory.

Provides the create_app() function that assembles the FastAPI application
with all middleware, services, and routes configured.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import AppConfig
from app.services.model_loader import ModelLoaderService
from app.services.prediction import PredictionService
from app.routes import prediction_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance.

    This factory function:
        1. Creates the FastAPI app with metadata.
        2. Configures CORS middleware.
        3. Loads all ML models via ModelLoaderService.
        4. Initializes the PredictionService with loaded models.
        5. Attaches services to app.state for dependency injection.
        6. Registers API routers.

    Returns:
        Fully configured FastAPI application ready to serve requests.
    """
    # 1. Create FastAPI instance
    application = FastAPI(title="DegradNet API")

    # 2. Configure CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=AppConfig.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Load models
    loader = ModelLoaderService()
    classifier, class_map = loader.load_material_classifier()
    seg_models = loader.load_segmentation_models()

    # 4. Initialize prediction service
    prediction_service = PredictionService(
        classifier=classifier,
        segmentation_models=seg_models,
    )

    # 5. Attach services to app state for dependency injection
    application.state.prediction_service = prediction_service
    application.state.class_map = class_map

    # 6. Register routes
    application.include_router(prediction_router)

    return application
