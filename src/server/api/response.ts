import { NextResponse } from 'next/server';

export type ApiSuccess<T> = { status: 'success'; data: T };
export type ApiErrorBody = {
  status: 'error';
  error: string;
  code?: string;
  details?: Record<string, string>;
};

export function apiSuccess<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ status: 'success', data }, init);
}

export function apiError(
  message: string,
  status = 400,
  code?: string,
  details?: Record<string, string>
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { status: 'error', error: message, code, details },
    { status }
  );
}

export function apiNotConfigured(): NextResponse<ApiErrorBody> {
  return apiError('Supabase is not configured', 503, 'SUPABASE_NOT_CONFIGURED');
}

export function apiUnauthorized(): NextResponse<ApiErrorBody> {
  return apiError('Unauthorized', 401, 'UNAUTHORIZED');
}

export function apiNotFound(resource = 'Resource'): NextResponse<ApiErrorBody> {
  return apiError(`${resource} not found`, 404, 'NOT_FOUND');
}
