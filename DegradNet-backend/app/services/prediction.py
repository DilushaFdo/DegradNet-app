"""Service for running material classification and degradation segmentation."""

import cv2
import math
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image


from app.config import AppConfig
from app.models.material_classifier import MaterialClassifier


class PredictionService:
    """Orchestrates the two-stage prediction pipeline.

    Stage 1: Classify the material type of the input image.
    Stage 2: Run the appropriate U-Net segmentation model to detect
             degradation regions, if the material is supported.
    """

    # Materials that use tiling at original resolution (trained on tiles)
    _TILED_MATERIALS = {"concrete", "wood", "metal"}

    def __init__(
        self,
        classifier: MaterialClassifier,
        segmentation_models: dict[str, nn.Module],
    ):
        """Initialize with pre-loaded models.

        Args:
            classifier: Loaded MaterialClassifier model.
            segmentation_models: Dict mapping material names to loaded UNet models.
        """
        self._classifier = classifier
        self._seg_models = segmentation_models
        self._device = AppConfig.DEVICE
        self._clf_transform = AppConfig.get_classification_transform()
        self._seg_transform = AppConfig.get_segmentation_transform()

    def predict(self, image: Image.Image, threshold: float = None, material_override: str = "auto") -> dict:
        """Run the full prediction pipeline on a PIL image.

        Args:
            image: RGB PIL Image to analyze.
            threshold: Binarization threshold for the segmentation mask.
                       Defaults to AppConfig.DEFAULT_THRESHOLD.
            material_override: If not "auto", skip Stage 1 classification and
                               use this material directly.

        Returns:
            Dict with keys: material, confidence, mask, binary, severity, image.
        """
        if threshold is None:
            threshold = AppConfig.DEFAULT_THRESHOLD

        # Stage 1: Material classification (or manual override)
        if material_override != "auto" and material_override in AppConfig.SUPPORTED_MATERIALS:
            material = material_override
            confidence = 1.0
        else:
            material, confidence = self._classify_material(image)

        # Log which U-Net model is being used
        if material in AppConfig.SUPPORTED_MATERIALS:
            print(f"[Analyze] Using U-Net model for material: '{material}' | Model path: {AppConfig.SEGMENTATION_PATHS[material]}")
        else:
            print(f"[Analyze] No U-Net model available for material: '{material}' (unsupported)")

        # Stage 2: Degradation segmentation
        mask, binary, severity = self._segment_degradation(image, material, threshold)

        return {
            "material": material,
            "confidence": float(confidence),
            "mask": mask,
            "binary": binary,
            "severity": float(severity),
            "image": image,
        }

    def _classify_material(self, image: Image.Image) -> tuple[str, float]:
        """Classify the material type of the input image.

        Returns:
            A tuple of (material_name, confidence_score).
        """
        x = self._clf_transform(image).unsqueeze(0).to(self._device)
        with torch.no_grad():
            logits = self._classifier(x)
            probs = F.softmax(logits, dim=1)
            cls_id = probs.argmax(1).item()

        material = AppConfig.MATERIALS[cls_id]
        confidence = probs[0, cls_id].item()
        return material, confidence

    def _segment_degradation(
        self, image: Image.Image, material: str, threshold: float
    ) -> tuple[np.ndarray, np.ndarray, float]:
        """Dispatch to the correct inference strategy based on material type."""

        orig_w, orig_h = image.size

        if material not in AppConfig.SUPPORTED_MATERIALS:
            return np.zeros((orig_h, orig_w), dtype=np.float32), np.zeros((orig_h, orig_w), dtype=np.uint8), 0.0

        if material in self._TILED_MATERIALS:
            final_mask = self._predict_tiled(image, material)
        else:
            final_mask = self._predict_resized(image, material)

        binary = (final_mask > threshold).astype(np.uint8)
        severity = float(binary.sum() / binary.size)

        return final_mask, binary, severity

    def _predict_resized(self, image: Image.Image, material: str) -> np.ndarray:
        """Resize whole image to 256x256, predict, upscale mask back.

        Used for materials trained on whole resized images.
        """
        orig_w, orig_h = image.size
        tile_size = AppConfig.SEGMENTATION_SIZE[0]

        img_resized = image.resize((tile_size, tile_size), Image.BILINEAR)

        img_np = np.array(img_resized).astype("float32") / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        img_norm = (img_np - mean) / std

        model = self._seg_models[material]
        input_tensor = torch.from_numpy(img_norm.transpose(2, 0, 1)).unsqueeze(0).float().to(self._device)
        with torch.no_grad():
            logits = model(input_tensor)
            probs = torch.sigmoid(logits)[0, 0].cpu().numpy()

        # Upscale heatmap back to original dimensions
        final_mask = cv2.resize(probs, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
        return final_mask


    def _predict_tiled(self, image: Image.Image, material: str) -> np.ndarray:
        """Tile the image at original resolution, predict per tile, stitch smoothly.

        Uses an overlapping sliding window with Hann window blending to eliminate seams.
        Used for: concrete, wood, metal.
        """
        tile_size = AppConfig.SEGMENTATION_SIZE[0]
        stride = tile_size // 2  # 50% overlap
        
        img_np = np.array(image)
        orig_h, orig_w, _ = img_np.shape

        # 1. Create a 2D Hann window for smooth blending
        window = np.hanning(tile_size)
        weight_mask = np.outer(window, window).astype(np.float32)

        # 2. Pad the image so we can slide over the edges cleanly
        pad_h = math.ceil(orig_h / stride) * stride + tile_size
        pad_w = math.ceil(orig_w / stride) * stride + tile_size
        
        img_padded = np.zeros((pad_h, pad_w, 3), dtype=np.float32)
        img_padded[:orig_h, :orig_w, :] = img_np
        
        # Accumulators for the final merged predictions
        pred_map = np.zeros((pad_h, pad_w), dtype=np.float32)
        weight_sum = np.zeros((pad_h, pad_w), dtype=np.float32)
        
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        model = self._seg_models[material]

        # 3. Slide over the image, predict, and accumulate with weights
        for y in range(0, orig_h, stride):
            for x in range(0, orig_w, stride):
                tile = img_padded[y:y+tile_size, x:x+tile_size, :]
                
                # Normalize
                tile_norm = tile.astype("float32") / 255.0
                tile_norm = (tile_norm - mean) / std
                
                # Predict
                input_tensor = torch.from_numpy(tile_norm.transpose(2, 0, 1)).unsqueeze(0).float().to(self._device)
                with torch.no_grad():
                    logits = model(input_tensor)
                    probs = torch.sigmoid(logits)[0, 0].cpu().numpy()
                
                # Blend into accumulator
                pred_map[y:y+tile_size, x:x+tile_size] += probs * weight_mask
                weight_sum[y:y+tile_size, x:x+tile_size] += weight_mask

        # 4. Normalize by weight sum to get final seamless heatmap
        weight_sum[weight_sum == 0] = 1.0  # avoid divide by zero
        final_mask_padded = pred_map / weight_sum
        
        # Crop back to exact original dimensions
        final_mask = final_mask_padded[:orig_h, :orig_w]
        
        return final_mask
