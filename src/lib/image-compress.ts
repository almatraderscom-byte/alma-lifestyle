import imageCompression from 'browser-image-compression';

/**
 * Compress large images in the browser before upload (keeps under Vercel body limit).
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size < 1024 * 1024) return file;

  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
    fileType: file.type,
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(
      '[Compress] Original:',
      file.size,
      'Compressed:',
      compressed.size
    );
    return compressed;
  } catch (err) {
    console.error('[Compress] Failed:', err);
    return file;
  }
}
