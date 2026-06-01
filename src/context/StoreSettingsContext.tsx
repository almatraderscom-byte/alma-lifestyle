'use client';

import { createContext, useContext, useMemo } from 'react';
import type { AppSettings } from '@/lib/admin-settings-types';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';

const StoreSettingsContext = createContext<AppSettings>(getDefaultAppSettings());

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: AppSettings;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ ...getDefaultAppSettings(), ...settings }),
    [settings]
  );
  return (
    <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): AppSettings {
  return useContext(StoreSettingsContext);
}

/** E.164 digits only for wa.me links */
export function whatsappE164(settings: AppSettings): string {
  const code = settings.whatsappCountryCode.replace(/\D/g, '');
  const num = settings.whatsappNumber.replace(/\D/g, '');
  return `${code}${num}`;
}
