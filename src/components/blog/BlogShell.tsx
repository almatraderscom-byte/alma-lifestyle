import type { ReactNode } from 'react';
import Link from 'next/link';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

/**
 * The blog's page shell — the same Obsidian document look as the content pages (PageLayout): dark chrome, a
 * hero band, a light paper article. `html` lands as the article's direct children so the .ob-prose typography
 * applies; `after` sits under the article (the list of posts, related links).
 */
export function BlogShell({
  badge,
  heroWord,
  title,
  meta,
  html,
  after,
}: {
  badge: string;
  heroWord: string;
  title: string;
  meta?: string;
  html?: string;
  after?: ReactNode;
}) {
  return (
    <ObsidianShell className="ob-doc" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light={badge} />
          <FloatingWord text={heroWord} tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{title}</h1>
          {meta && <p className="doc-hero-updated bn">{meta}</p>}
        </div>
      </section>
      <section className="doc-body">
        <div className="container">
          {html && <article className="ob-prose bn blog-article" data-ob-reveal dangerouslySetInnerHTML={{ __html: html }} />}
          {after}
          <aside className="doc-help" data-ob-reveal>
            <h3 className="bn-serif">পছন্দের ডিজাইন খুঁজছেন?</h3>
            <p className="bn">সাইজ, রং বা অর্ডার নিয়ে যেকোনো প্রশ্নে আমরা পাশে আছি</p>
            <div className="doc-help-actions">
              <WhatsAppLink className="ob-btn solid">WhatsApp এ চ্যাট করুন</WhatsAppLink>
              <Link href="/products" className="ob-btn">সব পণ্য দেখুন</Link>
            </div>
            <p className="doc-help-links bn">
              <Link href="/blog">সব লেখা</Link>
              <span aria-hidden> · </span>
              <Link href="/size-guide">সাইজ গাইড</Link>
              <span aria-hidden> · </span>
              <Link href="/faq">সাধারণ প্রশ্ন</Link>
            </p>
          </aside>
        </div>
      </section>
    </ObsidianShell>
  );
}
