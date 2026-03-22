"""Centralized configuration and constants for the DegradNet backend."""

import os
import torch
from torchvision import transforms


class AppConfig:
    """Application-wide configuration constants and transform pipelines."""

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Material classification
    MATERIALS = ["concrete", "metal", "wood"]
    SUPPORTED_MATERIALS = ["concrete", "metal", "wood"]
    DEFAULT_CLASS_MAP = {0: "concrete", 1: "metal", 2: "wood"}

    # Model file paths
    CLASSIFIER_PATH = os.path.join(MODELS_DIR, "best_material_classifierVersion3.pth")
    SEGMENTATION_PATHS = {
        "concrete": os.path.join(MODELS_DIR, "best_concrete_model.pth"),
        "metal": os.path.join(MODELS_DIR, "best_metal_model_version3.pth"),
        "wood": os.path.join(MODELS_DIR, "wood_real_world_best_version3.pth"),
    }

    # Prediction defaults
    DEFAULT_THRESHOLD = 0.5
    TILE_SIZE = 256
    SEGMENTATION_SIZE = (256, 256)
    CLASSIFICATION_SIZE = (224, 224)

    # CORS settings
    CORS_ORIGINS = ["*"]

    @staticmethod
    def get_classification_transform():
        """Return the image transform pipeline for material classification."""
        return transforms.Compose([
            transforms.Resize(AppConfig.CLASSIFICATION_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

    @staticmethod
    def get_segmentation_transform():
        """Return the image transform pipeline for segmentation."""
        return transforms.Compose([
            transforms.Resize(AppConfig.SEGMENTATION_SIZE),
            transforms.ToTensor(),
        ])
