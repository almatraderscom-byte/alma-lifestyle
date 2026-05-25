// TODO: remove after upload issue is resolved

export interface UploadHealthCheck {
  name: string;
  ok: boolean;
  durationMs: number;
  detail: Record<string, unknown>;
  error?: { message: string; code?: string; [key: string]: unknown };
}

export interface UploadHealthReport {
  overallOk: boolean;
  totalDurationMs: number;
  timestamp: string;
  checks: UploadHealthCheck[];
  summary: string;
}
