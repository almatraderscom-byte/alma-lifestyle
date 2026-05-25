import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import {
  reportHomepageUploadAttempt,
  type HomepageUploadAttemptRecord,
} from '@/lib/homepage-upload-debug';

const LOG = '[HomepageUpload]';

type ApiSuccess<T> = { status: 'success'; data: T };
type ApiError = { status: 'error'; error: string; code?: string };

/**
 * Upload an already-compressed file to Supabase (homepage-images bucket).
 * Records telemetry for the admin debug panel when a listener is registered.
 */
export async function uploadPreparedHomepageImage(
  file: File,
  folder: string
): Promise<string> {
  console.log(LOG, 'Uploading prepared file', {
    name: file.name,
    size: file.size,
    folder,
  });

  const requestStartedAt = new Date().toISOString();
  const started = performance.now();

  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  form.append('bucket', 'homepage-images');

  const baseRecord = {
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type,
    folder,
    requestStartedAt,
  };

  try {
    const res = await fetch('/api/v1/upload', {
      method: 'POST',
      body: form,
      credentials: 'include',
    });

    const durationMs = Math.round(performance.now() - started);
    const contentType = res.headers.get('content-type') || '';

    let responseBody: unknown = null;
    let rawResponseText: string | undefined;

    if (contentType.includes('application/json')) {
      responseBody = await res.json();
    } else {
      rawResponseText = await res.text();
      responseBody = {
        _parseNote: 'non-JSON response',
        preview: rawResponseText.slice(0, 500),
      };
    }

    const attempt: HomepageUploadAttemptRecord = {
      ...baseRecord,
      responseStatus: res.status,
      responseBody,
      rawResponseText,
      durationMs,
    };
    reportHomepageUploadAttempt(attempt);

    if (!contentType.includes('application/json')) {
      if (res.status === 413) {
        throw new Error('Image too large. Maximum 4MB allowed.');
      }
      throw new Error(`Upload failed: server returned ${res.status}`);
    }

    const json = responseBody as ApiSuccess<{ url: string } | string> | ApiError;
    if (json.status === 'error' || !res.ok) {
      const message = 'error' in json ? json.error : `Upload failed (${res.status})`;
      throw new Error(message);
    }

    const payload = json.data;
    const url =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'url' in payload
          ? payload.url
          : '';

    if (!url) {
      throw new Error('Upload response missing image URL');
    }

    if (url.startsWith('data:')) {
      throw new Error('Image must be uploaded to storage, not base64');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid image URL from server');
    }

    console.log(LOG, 'Success', url);
    return url;
  } catch (err) {
    const durationMs = Math.round(performance.now() - started);
    reportHomepageUploadAttempt({
      ...baseRecord,
      responseStatus: null,
      responseBody: null,
      durationMs,
      thrownError: {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
    throw err;
  }
}

/**
 * Compress (if needed) then upload to Supabase.
 */
export async function uploadHomepageImage(
  file: File,
  folder: string
): Promise<string> {
  const prepared = await prepareImageForUpload(file);
  return uploadPreparedHomepageImage(prepared, folder);
}
