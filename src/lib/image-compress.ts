import imageCompression from 'browser-image-compression';

export interface CompressImageOptions {
  /** Target max file size in megabytes */
  maxSizeMB: number;
  /** Longest edge cap in pixels */
  maxWidthOrHeight?: number;
  /** Output MIME type (defaults to source type, falls back to JPEG) */
  fileType?: string;
}

const DEFAULT_MAX_EDGE = 2400;

/**
 * Compress in the browser until under target size (or best effort after retries).
 */
export async function compressImage(
  file: File,
  options?: Partial<CompressImageOptions>
): Promise<File> {
  const targetBytes =
    (options?.maxSizeMB ?? 2) * 1024 * 1024;
  const maxEdge = options?.maxWidthOrHeight ?? DEFAULT_MAX_EDGE;

  if (file.size <= targetBytes) {
    return file;
  }

  const outputType =
    options?.fileType && options.fileType !== 'image/png'
      ? options.fileType
      : 'image/jpeg';

  const passes: CompressImageOptions[] = [
    {
      maxSizeMB: options?.maxSizeMB ?? 2,
      maxWidthOrHeight: maxEdge,
      fileType: outputType,
    },
    {
      maxSizeMB: Math.max(0.25, (options?.maxSizeMB ?? 2) * 0.75),
      maxWidthOrHeight: Math.round(maxEdge * 0.85),
      fileType: outputType,
    },
    {
      maxSizeMB: Math.max(0.2, (options?.maxSizeMB ?? 2) * 0.5),
      maxWidthOrHeight: Math.round(maxEdge * 0.7),
      fileType: outputType,
    },
    {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1200,
      fileType: 'image/jpeg',
    },
  ];

  let current = file;

  for (const pass of passes) {
    if (current.size <= targetBytes) break;

    try {
      const compressed = await imageCompression(current, {
        maxSizeMB: pass.maxSizeMB,
        maxWidthOrHeight: pass.maxWidthOrHeight ?? DEFAULT_MAX_EDGE,
        useWebWorker: true,
        fileType: pass.fileType ?? outputType,
        initialQuality: 0.85,
      });
      if (compressed.size < current.size) {
        current = compressed;
      }
    } catch (err) {
      console.error('[Compress] Pass failed:', err);
      break;
    }
  }

  if (current.size !== file.size) {
    console.log(
      '[Compress]',
      file.name,
      `${(file.size / 1024 / 1024).toFixed(2)}MB →`,
      `${(current.size / 1024 / 1024).toFixed(2)}MB`
    );
  }

  return current;
}
