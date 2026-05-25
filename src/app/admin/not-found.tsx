import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found | ALMA Admin',
  robots: { index: false, follow: false },
};

export default function AdminNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
        ALMA Admin
      </p>

      <h1 className="mt-6 text-2xl font-semibold text-neutral-900">Page not found</h1>

      <p className="mt-3 text-sm text-neutral-600 text-center max-w-md">
        The admin page you requested does not exist or may have been moved.
      </p>

      <Link
        href="/admin"
        className="mt-8 inline-flex items-center justify-center min-h-11 px-6 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
