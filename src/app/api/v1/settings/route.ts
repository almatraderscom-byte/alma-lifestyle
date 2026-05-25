import type { NextRequest } from 'next/server';
import { AppSettingsSchema, formatZodError } from '@/lib/api-validation';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import { getAppSettings, saveAppSettings } from '@/server/db/queries/homepage';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import {
  revalidateStorefront,
  STOREFRONT_PATHS,
} from '@/server/cache/revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function publicSettings(settings: ReturnType<typeof getDefaultAppSettings>) {
  return {
    storeName: settings.storeName,
    tagline: settings.tagline,
    logoUrl: settings.logoUrl,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsappCountryCode: settings.whatsappCountryCode,
    whatsappNumber: settings.whatsappNumber,
    physicalAddress: settings.physicalAddress,
    businessHours: settings.businessHours,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    youtubeUrl: settings.youtubeUrl,
    tiktokUrl: settings.tiktokUrl,
    freeDeliveryThresholdBdt: settings.freeDeliveryThresholdBdt,
    defaultDeliveryChargeBdt: settings.defaultDeliveryChargeBdt,
    freeDeliveryCities: settings.freeDeliveryCities,
    outsideCityDeliveryChargeBdt: settings.outsideCityDeliveryChargeBdt,
    estimatedDeliveryTime: settings.estimatedDeliveryTime,
    codEnabled: settings.codEnabled,
    usdExchangeRate: settings.usdExchangeRate,
    aedExchangeRate: settings.aedExchangeRate,
    showMultiCurrency: settings.showMultiCurrency,
    seoSiteTitleTemplate: settings.seoSiteTitleTemplate,
    seoSiteDescription: settings.seoSiteDescription,
  };
}

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

export async function GET() {
  const defaults = getDefaultAppSettings();

  if (!isSupabaseAdminConfigured()) {
    return apiSuccess(publicSettings(defaults));
  }

  return withPublicDb(async () => {
    const settings = (await getAppSettings()) ?? defaults;
    return apiSuccess(publicSettings(settings));
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400, 'VALIDATION_ERROR');
    }

    const parsed = AppSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 400, 'VALIDATION_ERROR');
    }

    const now = new Date().toISOString();
    const saved = await saveAppSettings({
      ...getDefaultAppSettings(),
      ...parsed.data,
      createdAt: parsed.data.createdAt ?? now,
      updatedAt: now,
    });

    revalidateStorefront(STOREFRONT_PATHS.settings);

    return apiSuccess(saved);
  });
}

export const POST = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
