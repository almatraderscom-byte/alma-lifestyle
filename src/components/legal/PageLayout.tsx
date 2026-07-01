import type { ReactNode } from 'react';
import Link from 'next/link';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

interface PageLayoutProps {
  badge?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  /** Large Latin ghost word for the hero band (Anton-friendly, uppercase). */
  heroWord?: string;
  children: ReactNode;
}

/**
 * Shared content/legal page shell (about, contact, delivery, refund, privacy,
 * terms, size-guide, FAQ). Reskinned onto the Obsidian design language: the
 * dark cinematic chrome + scroll-sky from `ObsidianShell`, a floating chromatic
 * hero word, and a tinted prose surface — all existing copy and the help/CTA
 * block preserved verbatim.
 */
export function PageLayout({
  badge,
  title,
  subtitle,
  lastUpdated,
  heroWord,
  children,
}: PageLayoutProps) {
  return (
    <ObsidianShell className="ob-doc" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light={badge ?? 'LIFESTYLE'} />
          {heroWord && (
            <FloatingWord text={heroWord} tone="light" className="doc-hero-word" />
          )}
          <h1 className="doc-hero-title bn-serif">{title}</h1>
          {subtitle && <p className="doc-hero-sub bn">{subtitle}</p>}
          {lastUpdated && (
            <p className="doc-hero-updated bn">সর্বশেষ আপডেট: {lastUpdated}</p>
          )}
        </div>
      </section>

      <section className="doc-body">
        <div className="container">
          <article className="ob-prose bn" data-ob-reveal>
            {children}
          </article>

          <aside className="doc-help" data-ob-reveal>
            <h3 className="bn-serif">আরো সাহায্য দরকার?</h3>
            <p className="bn">আমাদের কাস্টমার সার্ভিস টিম সবসময় আপনার পাশে আছে</p>
            <div className="doc-help-actions">
              <WhatsAppLink className="ob-btn solid">WhatsApp এ চ্যাট করুন</WhatsAppLink>
              <a href="tel:+8801307777733" className="ob-btn">
                ফোন করুন: 01307-777733
              </a>
              <a href="mailto:admin@almatraders.com" className="ob-btn">
                ইমেইল করুন
              </a>
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
