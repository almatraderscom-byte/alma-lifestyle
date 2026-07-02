import type { ReactNode } from 'react';
import Link from 'next/link';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

interface PageLayoutProps {
  badge?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  /** Large Latin ghost word for the hero band (Anton-friendly, uppercase). */
  heroWord?: string;
  /** When set, admin overrides for this content-page slug are applied on top
   *  of the props below, and an override body (if any) replaces `children`. */
  slug?: string;
  children: ReactNode;
}

function formatLocalPhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('880') ? `0${digits.slice(3)}` : digits;
}

/**
 * Shared content/legal page shell (about, contact, delivery, refund, privacy,
 * terms, size-guide, FAQ). Reskinned onto the Obsidian design language: the
 * dark cinematic chrome + scroll-sky from `ObsidianShell`, a floating chromatic
 * hero word, and a tinted prose surface. Meta and body are admin-overridable
 * per `slug` via AppSettings.contentPages; unset fields fall back to the props
 * and `children` passed by each page, so an empty override changes nothing.
 */
export async function PageLayout({
  badge,
  title,
  subtitle,
  lastUpdated,
  heroWord,
  slug,
  children,
}: PageLayoutProps) {
  const settings = await loadPublicSettingsServer();
  const override = slug ? settings.contentPages?.[slug] : undefined;

  const rBadge = override?.badge || badge;
  const rTitle = override?.title || title;
  const rSubtitle = override?.subtitle || subtitle;
  const rHeroWord = override?.heroWord || heroWord;
  const rLastUpdated = override?.lastUpdated || lastUpdated;
  const bodyHtml = override?.bodyHtml?.trim();

  const phone = formatLocalPhone(settings.contactPhone);
  const phoneDigits = (settings.contactPhone || '').replace(/\D/g, '');

  return (
    <ObsidianShell className="ob-doc" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light={rBadge ?? 'LIFESTYLE'} />
          {rHeroWord && (
            <FloatingWord text={rHeroWord} tone="light" className="doc-hero-word" />
          )}
          <h1 className="doc-hero-title bn-serif">{rTitle}</h1>
          {rSubtitle && <p className="doc-hero-sub bn">{rSubtitle}</p>}
          {rLastUpdated && (
            <p className="doc-hero-updated bn">সর্বশেষ আপডেট: {rLastUpdated}</p>
          )}
        </div>
      </section>

      <section className="doc-body">
        <div className="container">
          {bodyHtml ? (
            <article
              className="ob-prose bn"
              data-ob-reveal
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <article className="ob-prose bn" data-ob-reveal>
              {children}
            </article>
          )}

          <aside className="doc-help" data-ob-reveal>
            <h3 className="bn-serif">আরো সাহায্য দরকার?</h3>
            <p className="bn">আমাদের কাস্টমার সার্ভিস টিম সবসময় আপনার পাশে আছে</p>
            <div className="doc-help-actions">
              <WhatsAppLink className="ob-btn solid">WhatsApp এ চ্যাট করুন</WhatsAppLink>
              {phoneDigits && (
                <a href={`tel:+${phoneDigits}`} className="ob-btn">
                  ফোন করুন: {phone}
                </a>
              )}
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="ob-btn">
                  ইমেইল করুন
                </a>
              )}
            </div>
            <p className="doc-help-links bn">
              <Link href="/faq">সাধারণ প্রশ্ন</Link>
              <span aria-hidden> · </span>
              <Link href="/contact">যোগাযোগ</Link>
            </p>
          </aside>
        </div>
      </section>
    </ObsidianShell>
  );
}
