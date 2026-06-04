'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { SITE } from '@/lib/content';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app-error]', error);
  }, [error]);

  const whatsappHref = `https://wa.me/${SITE.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <h1 className="font-bn-heading text-2xl md:text-3xl font-bold text-charcoal">
        কিছু একটা সমস্যা হয়েছে। আমরা চেষ্টা করছি ঠিক করতে।
      </h1>
      <p className="font-bn-body text-base text-neutral-600 mt-3 max-w-md">
        একটু পর আবার চেষ্টা করুন। সমস্যা থাকলে WhatsApp এ যোগাযোগ করুন।
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-12 px-8 rounded-lg bg-[#C97D5D] text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f]"
        >
          আবার চেষ্টা করুন
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-12 inline-flex items-center justify-center px-8 rounded-lg border-2 border-charcoal/20 font-bn-body text-base font-medium text-charcoal"
        >
          WhatsApp সাপোর্ট
        </a>
      </div>
      <Link
        href="/"
        className="mt-6 font-bn-body text-sm text-[#C97D5D] underline underline-offset-4"
      >
        হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}
