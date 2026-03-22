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
    def mask_to_base64(mask: np.ndarray, original_img: Image.Image = None) -> str:
        """Render a numpy mask as an alpha-blended colormapped PNG.

        Uses OpenCV's INFERNO colormap at the mask's native resolution.
        If an original image is provided, it blends the heatmap over the
        original image using the mask probability as the alpha channel.

        Args:
            mask: 2D numpy array (float) representing the raw probability mask.
            original_img: Optional PIL Image to blend the heatmap over.

        Returns:
            Base64-encoded PNG string of the colormap-rendered mask or blended image.
        """
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
        """Render a raw probability mask (0-1) as a 8-bit grayscale PNG.
        
        This retains all probability information in a highly compressed format,
        allowing the frontend to perform real-time thresholding and colormapping.
        """
        mask_u8 = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
        img = Image.fromarray(mask_u8, mode="L")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    @staticmethod
    def mask_to_surface_data(mask: np.ndarray, size: int = 100) -> list:
        """Downsample the probability mask for frontend 3D rendering.

        Scales the mask to a smaller fixed size (e.g., 100x100) to keep JSON payload
        lightweight and ensure smooth interactive 3D rendering in the browser.

        Args:
            mask: 2D numpy array (float 0-1) representing raw probability.
            size: Target dimensions (size x size) for the returned array.

        Returns:
            A 2D list of floats representing the downsampled probability surface.
        """
        # Resize using INTER_AREA for downsampling
        resized = cv2.resize(mask, (size, size), interpolation=cv2.INTER_AREA)
        # Round to 3 decimal places to reduce JSON string length
        return np.round(resized, 3).tolist()

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
