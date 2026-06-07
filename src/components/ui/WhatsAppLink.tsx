'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { trackLead } from '@/lib/pixel';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';

type WhatsAppLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  message?: string;
  children: ReactNode;
};

export function WhatsAppLink({ message, children, onClick, ...props }: WhatsAppLinkProps) {
  const settings = useStoreSettings();
  const href = buildWhatsAppHref(settings, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        trackLead();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
