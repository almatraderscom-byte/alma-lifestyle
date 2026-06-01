import type { NextRequest } from 'next/server';
import { revalidateStorefrontAll } from '@/lib/storefront/revalidate';
import { apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    revalidateStorefrontAll();
    return apiSuccess({ revalidated: true, time: new Date().toISOString() });
  });
}
