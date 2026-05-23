import Link from 'next/link';
import { SITE, FOOTER } from '@/lib/content';
import { cn } from '@/lib/utils';

export function Footer() {
  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}`;

  return (
    <footer className="bg-primary text-secondary mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-brand text-3xl text-secondary">{SITE.brandName}</p>
            <p className="font-bn-body text-base text-secondary/80 mt-3 leading-relaxed">
              {SITE.tagline}
            </p>
            <a
              href={whatsappHref}
              className="inline-flex items-center gap-2 mt-4 font-bn-body text-base text-[#25D366] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden>📱</span>
              {FOOTER.phoneDisplay}
            </a>
            <div className="flex gap-4 mt-5" aria-label="সোশ্যাল মিডিয়া">
              <SocialDot label="Facebook" />
              <SocialDot label="Instagram" />
            </div>
          </div>

          <div>
            <h3 className="font-bn-heading text-lg font-semibold text-secondary mb-4">
              {FOOTER.quickLinksTitle}
            </h3>
            <ul className="space-y-3">
              {FOOTER.quickLinks.map((link) => (
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
        </div>

        <div className="mt-10 pt-8 border-t border-secondary/15">
          <p className="font-bn-body text-sm text-secondary/60 text-center md:text-left">
            {FOOTER.bottomLine}
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

function SocialDot({ label }: { label: string }) {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary/80 text-xs font-bn-body"
      aria-label={label}
    >
      {label.charAt(0)}
    </span>
  );
}
