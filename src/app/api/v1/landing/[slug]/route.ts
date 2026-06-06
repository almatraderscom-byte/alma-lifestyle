import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import {
  MURDA_MOSHARI_LAYOUT_KEY,
  MURDA_MOSHARI_SLUG,
  murdaMoshariContentSchema,
  type MurdaMoshariContent,
} from '@/lib/landing-content-types';
import {
  murdaPricingFromDbProduct,
  syncMurdaPricingFromProduct,
} from '@/lib/murda-moshari-pricing';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { getAdminFromRequest } from '@/server/api/auth';
import {
  getLandingContent,
  resolveMurdaLayoutKey,
  saveLandingContent,
} from '@/server/db/queries/landing-content';
import { getProductBySlug } from '@/server/db/queries/products';
import { revalidateProductPages } from '@/lib/storefront/revalidate';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function withMurdaProductPricing(
  slug: string,
  content: MurdaMoshariContent
): Promise<MurdaMoshariContent> {
  if (slug !== MURDA_MOSHARI_SLUG) return content;
  const product = await getProductBySlug(slug);
  if (!product) return content;
  return syncMurdaPricingFromProduct(content, murdaPricingFromDbProduct(product));
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!isSupabaseAdminConfigured()) {
    if (slug === MURDA_MOSHARI_SLUG) {
      return apiSuccess(getDefaultMurdaMoshariContent());
    }
    return apiNotFound('Landing content');
  }

  return withPublicDb(async () => {
    const content = await getLandingContent(slug);
    if (!content) {
      if (slug === MURDA_MOSHARI_SLUG) {
        return apiSuccess(await withMurdaProductPricing(slug, getDefaultMurdaMoshariContent()));
      }
      return apiNotFound('Landing content');
    }
    return apiSuccess(await withMurdaProductPricing(slug, content));
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withAdmin(request, async () => {
    const { slug } = await context.params;
    const body = (await request.json()) as { content?: unknown; layoutKey?: string };

    const parsed = murdaMoshariContentSchema.safeParse(body.content);
    if (!parsed.success) {
      return apiError('Invalid landing content', 400, 'VALIDATION_ERROR');
    }

    const contentToSave =
      slug === MURDA_MOSHARI_SLUG
        ? await withMurdaProductPricing(slug, parsed.data)
        : parsed.data;

    const admin = getAdminFromRequest(request);
    const layoutKey = resolveMurdaLayoutKey(
      body.layoutKey ?? (slug === MURDA_MOSHARI_SLUG ? MURDA_MOSHARI_LAYOUT_KEY : undefined)
    );

    const saved = await saveLandingContent(slug, layoutKey, contentToSave, admin?.userId);
    revalidateProductPages(slug);
    return apiSuccess(
      slug === MURDA_MOSHARI_SLUG ? await withMurdaProductPricing(slug, saved) : saved
    );
  });
}
