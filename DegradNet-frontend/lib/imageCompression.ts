/**
 * Client-side image compression utility.
 *
 * Resizes large camera photos to a sensible maximum dimension and
 * re-encodes them as JPEG to dramatically reduce file size before upload.
 * This makes mobile camera captures upload 5-10× faster with no
 * meaningful loss for degradation-detection models.
 */

/** Configuration */
const MAX_DIMENSION = 1600; // px – longest side
const JPEG_QUALITY = 0.8;

interface CompressedImage {
  file: File;
  preview: string; // data-URL for <img> preview
}

/**
 * Compress / resize an image file on the client side.
 *
 * - Images smaller than MAX_DIMENSION are only re-encoded (still saves
 *   size because camera JPEGs carry heavy EXIF / high-quality encoding).
 * - Modern browsers auto-apply EXIF orientation when drawing to canvas,
 *   so rotated mobile photos will display correctly.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // ── Determine output dimensions ──────────────────────────
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        // ── Draw to an off-screen canvas ─────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // ── Export as JPEG blob ───────────────────────────────────
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            // Build a new File with a sensible name
            const compressedName = file.name.replace(/\.[^.]+$/, '.jpg');
            const compressedFile = new File([blob], compressedName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            // Re-use the canvas to generate a lightweight preview URL
            const preview = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

            resolve({ file: compressedFile, preview });
          },
          'image/jpeg',
          JPEG_QUALITY,
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));

    // Read the source file as a data-URL so the <img> can decode it
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
