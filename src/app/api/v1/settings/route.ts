import type { NextRequest } from 'next/server';
import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import { getAppSettings, saveAppSettings } from '@/server/db/queries/homepage';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

function publicSettings(settings: AppSettings) {
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
    const body = (await request.json()) as AppSettings;
    if (!body?.storeName) {
      return apiError('Invalid settings payload', 400, 'VALIDATION_ERROR');
    }

    const saved = await saveAppSettings({
      ...getDefaultAppSettings(),
      ...body,
    });

    return apiSuccess(saved);
  });
}
