import type { ReactNode } from 'react';
import Link from 'next/link';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';

interface PageLayoutProps {
  badge?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function PageLayout({
  badge,
  title,
  subtitle,
  lastUpdated,
  children,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-border-subtle bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {badge && (
            <p className="mb-3 font-bn-body text-sm font-medium tracking-widest text-terracotta">
              {badge}
            </p>
          )}
          <h1 className="font-bn-heading text-4xl font-bold text-charcoal md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl font-bn-body text-lg text-text-light">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-4 font-bn-body text-sm text-text-light">
              সর্বশেষ আপডেট: {lastUpdated}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none rounded-lg bg-white p-6 shadow-sm md:p-10">
            {children}
          </div>
        </div>
      </section>

      <section className="border-t border-border-subtle bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="font-bn-heading text-2xl font-semibold text-charcoal">
            আরো সাহায্য দরকার?
          </h3>
          <p className="mt-3 font-bn-body text-text-light">
            আমাদের কাস্টমার সার্ভিস টিম সবসময় আপনার পাশে আছে
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <WhatsAppLink className="rounded-md bg-emerald px-6 py-3 font-bn-body text-white transition hover:opacity-90">
              WhatsApp এ চ্যাট করুন
            </WhatsAppLink>
            <a
              href="tel:+8801307777733"
              className="rounded-md border-2 border-terracotta px-6 py-3 font-bn-body text-terracotta transition hover:bg-terracotta hover:text-white"
            >
              ফোন করুন: 01307-777733
            </a>
            <a
              href="mailto:admin@almatraders.com"
              className="rounded-md border-2 border-charcoal px-6 py-3 font-bn-body text-charcoal transition hover:bg-charcoal hover:text-white"
            >
              ইমেইল করুন
            </a>
          </div>
          <p className="mt-6 font-bn-body text-sm text-text-light">
            <Link href="/faq" className="text-terracotta underline hover:text-maroon">
              সাধারণ প্রশ্ন
            </Link>
            {' · '}
            <Link href="/contact" className="text-terracotta underline hover:text-maroon">
              যোগাযোগ
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
