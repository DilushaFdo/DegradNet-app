"""Utility service for image encoding and conversion."""

import base64
from io import BytesIO

import cv2
import numpy as np
from PIL import Image


class ImageUtilsService:
    """Helper class to convert images to base64 strings so they can be sent in the JSON response."""

    @staticmethod
    def mask_to_base64(mask: np.ndarray, original_img: Image.Image = None) -> str:
        """Makes a colored heatmap from the prediction mask and blends it with the original image."""
        mask_clipped = np.clip(mask, 0, 1)
        mask_u8 = (mask_clipped * 255).astype(np.uint8)
        heatmap_bgr = cv2.applyColorMap(mask_u8, cv2.COLORMAP_INFERNO)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        if original_img is not None:
            orig_array = np.array(original_img)
            # Ensure the original image matches the mask dimensions
            if orig_array.shape[:2] != mask.shape[:2]:
                orig_array = cv2.resize(orig_array, (mask.shape[1], mask.shape[0]))
            
            # Alpha blending: 0 probability = transparent (original image), 1 probability = fully heatmap
            # Add an extra axis to mask_clipped for broadcasting over color channels (H, W, 1)
            alpha = mask_clipped[:, :, np.newaxis]
            
            # Blend: original * (1 - alpha) + heatmap * alpha
            # Ensure operations are done in float to prevent overflow, then convert back to uint8
            blended = (orig_array * (1 - alpha) + heatmap_rgb * alpha).astype(np.uint8)
            out_img = Image.fromarray(blended)
        else:
            out_img = Image.fromarray(heatmap_rgb)

        buf = BytesIO()
        out_img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def probability_mask_to_base64(mask: np.ndarray) -> str:
        """Covert the raw mask to a grayscale image so the frontend can use it."""
        mask_u8 = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
        img = Image.fromarray(mask_u8, mode="L")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def mask_to_surface_data(mask: np.ndarray, size: int = 100) -> list:
        """Resize the mask to a smaller 100x100 array so the 3D map doesn't lag the browser."""
        # Resize using INTER_AREA for downsampling
        resized = cv2.resize(mask, (size, size), interpolation=cv2.INTER_AREA)
        # Round to 3 decimal places to reduce JSON string length
        return np.round(resized, 3).tolist()

    @staticmethod
    def binary_mask_to_base64(mask: np.ndarray) -> str:
        """Convert the black and white output mask into a base64 string."""
        img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def image_to_base64(image: Image.Image) -> str:
        """Convert normal image to a base64 string."""
        buf = BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
