"""Utility service for image encoding and conversion."""

import base64
from io import BytesIO

import cv2
import numpy as np
from PIL import Image


class ImageUtilsService:
    """Provides static utility methods for image-to-base64 conversion.

    Used by the API routes to encode prediction outputs (masks, images)
    for JSON responses.
    """

    @staticmethod
    def mask_to_base64(mask: np.ndarray) -> str:
        """Render a numpy mask as a colormapped PNG and return as base64.

        Uses OpenCV's jet colormap at the mask's native resolution so the
        heatmap is always pixel-perfect, regardless of image size.

        Args:
            mask: 2D numpy array (float) representing the raw probability mask.

        Returns:
            Base64-encoded PNG string of the colormap-rendered mask.
        """
        mask_u8 = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
        heatmap_bgr = cv2.applyColorMap(mask_u8, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        img = Image.fromarray(heatmap_rgb)
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def binary_mask_to_base64(mask: np.ndarray) -> str:
        """Render a binary mask as a grayscale PNG and return as base64.

        White pixels represent detected defect areas, black pixels are clean.

        Args:
            mask: 2D numpy array (0/1 uint8) representing the binary mask.

        Returns:
            Base64-encoded PNG string of the grayscale mask.
        """
        img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def image_to_base64(image: Image.Image) -> str:
        """Convert a PIL Image to a base64-encoded PNG string.

        Args:
            image: PIL Image to encode.

        Returns:
            Base64-encoded PNG string.
        """
        buf = BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
