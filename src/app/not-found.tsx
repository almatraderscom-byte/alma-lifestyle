import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'পেজ পাওয়া যায়নি | ALMA Lifestyle',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-warm-white">
      <Link
        href="/"
        className="font-brand text-3xl md:text-4xl font-semibold tracking-wide text-primary hover:text-terracotta transition-colors"
      >
        {SITE.brandName}
      </Link>

      <p className="mt-8 font-bn-body text-sm uppercase tracking-widest text-terracotta">
        ৪০৪
      </p>

      <h1 className="mt-3 font-brand text-2xl md:text-3xl font-semibold text-primary text-center max-w-lg">
        পেজটি খুঁজে পাওয়া যায়নি
      </h1>

      <p className="mt-4 font-bn-body text-base text-text-light text-center max-w-md leading-relaxed">
        আপনি যে পেজটি খুঁজছেন সেটি নেই, সরানো হয়েছে, অথবা ঠিকানাটি ভুল হয়েছে। চিন্তা
        নেই — নিচের লিংক থেকে আবার শুরু করতে পারেন।
      </p>

      {/* TODO(ERR-001): optional popular categories from loadCatalogProductsServer (limit 4) */}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center min-h-12 px-6 rounded-lg bg-terracotta text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f] transition-colors"
        >
          হোমে ফিরুন
        </Link>
        <Link
          href="/products"
          className="flex-1 inline-flex items-center justify-center min-h-12 px-6 rounded-lg border border-border-subtle bg-background text-primary font-bn-body text-base font-semibold hover:border-primary/30 transition-colors"
        >
          সব পণ্য দেখুন
        </Link>
      </div>
    </div>
  );
}
