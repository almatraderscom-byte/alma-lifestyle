// TODO: remove after upload issue is resolved

/** In-memory telemetry for the homepage admin debug panel (not persisted). */

export interface HomepageUploadAttemptRecord {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  folder: string;
  requestStartedAt: string;
  responseStatus: number | null;
  responseBody: unknown;
  rawResponseText?: string;
  durationMs: number;
  thrownError?: { message: string; stack?: string };
}

type UploadAttemptListener = (record: HomepageUploadAttemptRecord) => void;

let listener: UploadAttemptListener | null = null;

export function setHomepageUploadAttemptListener(fn: UploadAttemptListener | null): void {
  listener = fn;
}

export function reportHomepageUploadAttempt(record: HomepageUploadAttemptRecord): void {
  listener?.(record);
}
