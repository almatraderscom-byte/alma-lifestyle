'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';

type WhatsAppLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  message?: string;
  children: ReactNode;
};

export function WhatsAppLink({ message, children, ...props }: WhatsAppLinkProps) {
  const settings = useStoreSettings();
  const href = buildWhatsAppHref(settings, message);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
