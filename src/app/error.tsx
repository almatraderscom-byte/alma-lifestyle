'use client';

import Link from 'next/link';
import { useEffect } from 'react';

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

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-bn-heading text-2xl md:text-3xl font-bold text-primary">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="font-bn-body text-base text-text-light mt-3 max-w-md">
        আমরা সমস্যাটি ঠিক করার চেষ্টা করছি। একটু পর আবার চেষ্টা করুন, অথবা সরাসরি যোগাযোগ করুন।
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-12 px-8 rounded-lg bg-primary text-secondary font-bn-body text-base font-semibold"
        >
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/contact"
          className="min-h-12 inline-flex items-center justify-center px-8 rounded-lg border border-border-subtle font-bn-body text-base font-medium text-primary"
        >
          যোগাযোগ করুন
        </Link>
      </div>
    </div>
  );
}
