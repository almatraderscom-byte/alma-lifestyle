/** Safe max for Vercel serverless request body (~4.5MB limit). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uploadSizeErrorMessage(sizeBytes: number): string {
  return `Image too large. Maximum 4MB allowed. Current size: ${formatFileSize(sizeBytes)}. Please compress your image at tinypng.com or use a smaller image.`;
}
