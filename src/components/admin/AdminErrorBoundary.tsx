'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function AdminFallback() {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-lg mx-auto my-8"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-red-900">Something went wrong</h2>
      <p className="text-sm text-red-800 mt-2">
        This page encountered an error. Refresh the page or return to the dashboard.
      </p>
      <a
        href="/admin"
        className="inline-block mt-4 text-sm font-medium text-red-900 underline"
      >
        Back to Dashboard
      </a>
    </div>
  );
}

/** Error boundary with English messaging for the admin panel. */
export function AdminErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<AdminFallback />}
      onError={(error) => {
        if (typeof window !== 'undefined' && 'reportError' in window) {
          window.reportError(error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
