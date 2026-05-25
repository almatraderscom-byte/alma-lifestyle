'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/content';
import { reportError } from '@/lib/errors/report';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    reportError({ error, context: { boundary: 'app/error' } });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-warm-white">
      <Link
        href="/"
        className="font-brand text-3xl md:text-4xl font-semibold tracking-wide text-primary hover:text-terracotta transition-colors"
      >
        {SITE.brandName}
      </Link>

      <h1 className="mt-10 font-brand text-2xl md:text-3xl font-semibold text-primary text-center max-w-lg">
        কিছু একটা ভুল হয়েছে
      </h1>

      <p className="mt-4 font-bn-body text-base text-text-light text-center max-w-md leading-relaxed">
        দুঃখিত — আমাদের পক্ষ থেকে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা
        হোমপেজে ফিরে যান।
      </p>

      {isDev && (
        <details className="mt-6 w-full max-w-lg rounded-lg border border-border-subtle bg-background p-4 text-left">
          <summary className="font-bn-body text-sm font-medium text-primary cursor-pointer">
            Error details (development only)
          </summary>
          <p className="mt-2 font-mono text-xs text-text-light break-all">{error.message}</p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-text-light">Digest: {error.digest}</p>
          ) : null}
        </details>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => reset()}
          className="flex-1 min-h-12 px-6 rounded-lg bg-terracotta text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f] transition-colors"
        >
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center min-h-12 px-6 rounded-lg border border-border-subtle bg-background text-primary font-bn-body text-base font-semibold hover:border-primary/30 transition-colors"
        >
          হোমে ফিরুন
        </Link>
      </div>
    </div>
  );
}
