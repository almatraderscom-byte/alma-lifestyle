// TODO: remove after upload issue is resolved

import type { NextRequest } from 'next/server';
import { withAdmin } from '@/server/api/handler';
import { apiError, apiSuccess } from '@/server/api/response';
import { runUploadHealthChecks } from '@/server/storage/upload-health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const data = await runUploadHealthChecks();
    return apiSuccess(data);
  });
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
