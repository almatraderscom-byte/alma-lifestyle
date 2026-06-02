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

export { buildWhatsAppHref, whatsappE164 } from '@/lib/whatsapp';
