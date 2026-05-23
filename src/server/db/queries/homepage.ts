import { getSupabaseAdmin } from '../client';
import type { Json, SiteConfigRow } from '../schema';
import { assertNoError } from './errors';
import type { HomepageConfig } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';

const HOMEPAGE_KEY = 'homepage';
const SETTINGS_KEY = 'settings';

async function getConfigRow(key: string): Promise<SiteConfigRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('site_config')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  assertNoError(error, `getConfigRow:${key}`);
  return data as SiteConfigRow | null;
}

export async function getHomepageConfig(): Promise<HomepageConfig | null> {
  const row = await getConfigRow(HOMEPAGE_KEY);
  if (!row?.value) return null;
  return row.value as unknown as HomepageConfig;
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
  const value = {
    ...config,
    lastSaved: new Date().toISOString(),
  } as unknown as Json;

  const existing = await getConfigRow(HOMEPAGE_KEY);

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from('site_config')
      .update({ value } as never)
      .eq('key', HOMEPAGE_KEY)
      .select()
      .single();
    assertNoError(error, 'saveHomepageConfig.update');
    return (data as unknown as { value: unknown }).value as HomepageConfig;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site_config')
    .insert({ key: HOMEPAGE_KEY, value } as never)
    .select()
    .single();

  assertNoError(error, 'saveHomepageConfig.insert');
  return (data as unknown as { value: unknown }).value as HomepageConfig;
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const row = await getConfigRow(SETTINGS_KEY);
  if (!row?.value) return null;
  return { ...getDefaultAppSettings(), ...(row.value as object) };
}

export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const value = {
    ...settings,
    updatedAt: new Date().toISOString(),
  } as unknown as Json;

  const existing = await getConfigRow(SETTINGS_KEY);

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from('site_config')
      .update({ value } as never)
      .eq('key', SETTINGS_KEY)
      .select()
      .single();
    assertNoError(error, 'saveAppSettings.update');
    return {
      ...getDefaultAppSettings(),
      ...((data as unknown as { value: object }).value),
    };
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site_config')
    .insert({ key: SETTINGS_KEY, value } as never)
    .select()
    .single();

  assertNoError(error, 'saveAppSettings.insert');
  return {
    ...getDefaultAppSettings(),
    ...((data as unknown as { value: object }).value),
  };
}

export async function getHomepageConfigOrDefault(): Promise<HomepageConfig> {
  return (await getHomepageConfig()) ?? getDefaultHomepageConfig();
}
