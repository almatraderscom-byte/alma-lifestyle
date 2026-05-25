'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { reportError } from '@/lib/errors/report';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    reportError({ error, context: { boundary: 'app/admin/error' } });
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
        ALMA Admin
      </p>

      <h1 className="mt-6 text-2xl font-semibold text-neutral-900 text-center">
        Something went wrong
      </h1>

      <p className="mt-3 text-sm text-neutral-600 text-center max-w-md">
        This page encountered an error. Try again or return to the dashboard.
      </p>

      {isDev && (
        <details className="mt-6 w-full max-w-lg rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left">
          <summary className="text-sm font-medium text-neutral-800 cursor-pointer">
            Error details (development only)
          </summary>
          <p className="mt-2 font-mono text-xs text-neutral-600 break-all">{error.message}</p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-neutral-600">Digest: {error.digest}</p>
          ) : null}
        </details>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-11 px-6 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center min-h-11 px-6 rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
