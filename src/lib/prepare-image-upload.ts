import { compressImage } from '@/lib/image-compress';
import {
  MAX_UPLOAD_BYTES,
  formatFileSize,
  uploadSizeErrorMessage,
} from '@/lib/upload-limits';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface PrepareImageOptions {
  /** Slot-specific limit from image-specs (e.g. 1.5 MB) */
  maxSizeMB?: number;
  /** Resize long edge to match recommended upload dimensions */
  maxWidthOrHeight?: number;
}

export interface PrepareImageResult {
  file: File;
  compressed: boolean;
  originalBytes: number;
}

function targetBytes(maxSizeMB?: number): number {
  const specLimit = maxSizeMB
    ? Math.floor(maxSizeMB * 1024 * 1024 * 0.98)
    : MAX_UPLOAD_BYTES;
  return Math.min(specLimit, MAX_UPLOAD_BYTES);
}

/**
 * Validate format, auto-compress oversized files, then ensure under upload limit.
 */
export async function prepareImageForUpload(
  file: File,
  options?: PrepareImageOptions
): Promise<File> {
  const result = await prepareImageForUploadDetailed(file, options);
  return result.file;
}

export async function prepareImageForUploadDetailed(
  file: File,
  options?: PrepareImageOptions
): Promise<PrepareImageResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  const originalBytes = file.size;
  const limit = targetBytes(options?.maxSizeMB);
  const compressTargetMb = (options?.maxSizeMB ?? MAX_UPLOAD_BYTES / (1024 * 1024)) * 0.95;

  let prepared = file;

  const shouldCompress =
    prepared.size > limit ||
    prepared.size > 512 * 1024 ||
    Boolean(options?.maxSizeMB && prepared.size > options.maxSizeMB * 1024 * 1024);

  if (shouldCompress) {
    prepared = await compressImage(prepared, {
      maxSizeMB: compressTargetMb,
      maxWidthOrHeight: options?.maxWidthOrHeight,
      fileType: file.type === 'image/png' ? 'image/jpeg' : file.type,
    });
  }

  if (prepared.size > limit) {
    prepared = await compressImage(prepared, {
      maxSizeMB: Math.min(compressTargetMb, 0.35),
      maxWidthOrHeight: options?.maxWidthOrHeight ?? 1600,
      fileType: 'image/jpeg',
    });
  }

  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error(uploadSizeErrorMessage(prepared.size));
  }

  return {
    file: prepared,
    compressed: prepared.size < originalBytes,
    originalBytes,
  };
}

export function formatCompressionNotice(
  originalBytes: number,
  preparedBytes: number
): string {
  return `Image was optimized automatically (${formatFileSize(originalBytes)} → ${formatFileSize(preparedBytes)}) for faster loading.`;
}
