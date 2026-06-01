import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getProductsLivePrices } from '@/server/db/queries/product-prices';
import { apiError, apiSuccess } from '@/server/api/response';
import { withPublicDb } from '@/server/api/handler';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

const BodySchema = z.object({
  ids: z.array(z.string().uuid()).max(50),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return apiSuccess({ prices: {} });
  }

  return withPublicDb(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400, 'VALIDATION_ERROR');
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const prices = await getProductsLivePrices(parsed.data.ids);
    return apiSuccess({ prices });
  });
}
