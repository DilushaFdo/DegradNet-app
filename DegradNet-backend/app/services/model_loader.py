"""Service responsible for loading and initializing trained model weights."""

import torch
import segmentation_models_pytorch as smp
from app.config import AppConfig
from app.models.material_classifier import MaterialClassifier


class ModelLoaderService:
    """Handles loading of all pretrained model weights from disk.

    Returns ready-to-use models in eval mode on the configured device.
    """

    def __init__(self):
        self._device = AppConfig.DEVICE

    def load_material_classifier(self) -> tuple[MaterialClassifier, dict]:
        """Load the material classification model and its class mapping.

        Returns:
            A tuple of (model, class_map) where model is ready for inference.
        """
        checkpoint = torch.load(
            AppConfig.CLASSIFIER_PATH,
            map_location=self._device,
            weights_only=False,
        )

        # Remap keys to match the wrapper model structure
        new_state_dict = {
            "model." + k: v for k, v in checkpoint["model_state"].items()
        }

        model = MaterialClassifier().to(self._device)
        model.load_state_dict(new_state_dict)
        model.eval()

        class_map = checkpoint.get("class_map", AppConfig.DEFAULT_CLASS_MAP)
        return model, class_map

    def load_segmentation_models(self) -> dict[str, torch.nn.Module]:
        """Load SMP U-Net segmentation models for all supported materials.

        Returns:
            A dict mapping material name to its loaded smp.Unet model.
        """
        models = {}
        for material in AppConfig.SUPPORTED_MATERIALS:
            path = AppConfig.SEGMENTATION_PATHS[material]
            model = smp.Unet(
                encoder_name="resnet34",
                encoder_weights=None,
                in_channels=3,
                classes=1,
                activation=None,
            ).to(self._device)
            state_dict = torch.load(
                path, map_location=self._device, weights_only=False
            )
            model.load_state_dict(state_dict)
            model.eval()
            models[material] = model
        return models
