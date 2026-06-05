'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-warm-white px-4 text-center">
      <p className="font-brand text-sm uppercase tracking-[0.2em] text-mustard">ALMA Lifestyle</p>
      <h1 className="mt-4 font-bn-heading text-2xl font-bold text-charcoal">
        Page could not load
      </h1>
      <p className="mt-3 max-w-md font-bn-body text-base text-text-light">
        The site is temporarily busy. Please try again — your data is safe.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 min-h-12 rounded-lg bg-accent px-8 font-bn-body text-base font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
