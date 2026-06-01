'use client';

import Link from 'next/link';
import { FOOTER } from '@/lib/content';
import { useStoreSettings, whatsappE164 } from '@/context/StoreSettingsContext';
import { cn } from '@/lib/utils';

export function Footer() {
  const settings = useStoreSettings();
  const whatsappHref = `https://wa.me/${whatsappE164(settings)}`;
  const phoneDisplay = settings.contactPhone
    ? `+${settings.contactPhone.replace(/\D/g, '')}`
    : FOOTER.phoneDisplay;

  return (
    <footer className="bg-primary text-secondary mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="font-brand text-3xl text-secondary">{settings.storeName}</p>
            <p className="font-bn-body text-base text-secondary/80 mt-3 leading-relaxed">
              {settings.tagline}
            </p>
            {settings.contactEmail && (
              <p className="font-bn-body text-sm text-secondary/70 mt-2">{settings.contactEmail}</p>
            )}
            {settings.physicalAddress && (
              <p className="font-bn-body text-sm text-secondary/70 mt-1">{settings.physicalAddress}</p>
            )}
            <a
              href={whatsappHref}
              className="inline-flex items-center gap-2 mt-4 font-bn-body text-base text-[#25D366] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden>📱</span>
              {phoneDisplay}
            </a>
            <div className="flex gap-4 mt-5" aria-label="সোশ্যাল মিডিয়া">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary/80 text-xs font-bn-body hover:bg-secondary/20"
                  aria-label="Facebook"
                >
                  f
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary/80 text-xs font-bn-body hover:bg-secondary/20"
                  aria-label="Instagram"
                >
                  ig
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bn-heading text-lg font-semibold text-secondary mb-4">
              {FOOTER.shopTitle}
            </h3>
            <ul className="space-y-3">
              {FOOTER.shopLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-bn-body text-base text-secondary/75 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bn-heading text-lg font-semibold text-secondary mb-4">
              {FOOTER.helpTitle}
            </h3>
            <ul className="space-y-3">
              {FOOTER.helpLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-bn-body text-base text-secondary/75 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bn-heading text-lg font-semibold text-secondary mb-4">
              {FOOTER.companyTitle}
            </h3>
            <ul className="space-y-3">
              {FOOTER.companyLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-bn-body text-base text-secondary/75 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 font-bn-body text-sm text-secondary/70">
              <p>
                <a href="tel:+8801307777733" className="hover:text-secondary">
                  01307-777733
                </a>
              </p>
              <p>
                <a href="mailto:admin@almatraders.com" className="hover:text-secondary">
                  admin@almatraders.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-secondary/15">
          <p className="font-bn-body text-sm text-secondary/60 text-center md:text-left">
            {FOOTER.bottomLine.replace('ALMA Lifestyle', settings.storeName)}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            {FOOTER.payments.map((method) => (
              <span
                key={method}
                className={cn(
                  'font-bn-body text-xs px-3 py-1.5 rounded-md',
                  'bg-secondary/10 text-secondary/90 border border-secondary/20'
                )}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
