import type { ImageSpec } from '@/lib/image-specs';
import { getAspectRatioDecimal } from '@/lib/image-specs';

export async function getImageDimensionsFromFile(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = objectUrl;
  });
}

export function validateImageFileBasics(
  file: File,
  spec: ImageSpec
): { error?: string } {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > spec.maxSizeMB) {
    return {
      error: `File too large: ${sizeMB.toFixed(1)}MB. Maximum allowed: ${spec.maxSizeMB}MB`,
    };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!spec.acceptedFormats.includes(ext)) {
    return {
      error: `Invalid format. Accepted: ${spec.acceptedFormats.join(', ').toUpperCase()}`,
    };
  }

  return {};
}

export async function getImageDimensionWarnings(
  file: File,
  spec: ImageSpec
): Promise<string | undefined> {
  try {
    const actualDims = await getImageDimensionsFromFile(file);
    const targetRatio = getAspectRatioDecimal(spec);
    const actualRatio = actualDims.width / actualDims.height;
    const ratioDiff = Math.abs(actualRatio - targetRatio) / targetRatio;

    if (ratioDiff > 0.1) {
      return `Aspect ratio mismatch! Your image: ${actualDims.width}×${actualDims.height}px. Recommended: ${spec.recommended.width}×${spec.recommended.height}px. Image may look cropped or stretched.`;
    }
    if (actualDims.width < spec.recommended.width * 0.7) {
      return `Image is smaller than recommended. Your image: ${actualDims.width}px wide. Recommended: ${spec.recommended.width}px. May appear pixelated on large screens.`;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
