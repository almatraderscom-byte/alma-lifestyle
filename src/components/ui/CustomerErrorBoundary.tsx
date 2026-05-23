'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface CustomerErrorBoundaryProps {
  children: React.ReactNode;
  /** Short Bangla label for the failed block (e.g. "হিরো সেকশন") */
  sectionLabel?: string;
}

function CustomerSectionFallback({ sectionLabel }: { sectionLabel?: string }) {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-12 md:px-6 text-center"
      aria-live="polite"
    >
      <p className="font-bn-heading text-lg text-primary">
        {sectionLabel
          ? `${sectionLabel} লোড করা যায়নি`
          : 'এই অংশটি লোড করা যায়নি'}
      </p>
      <p className="font-bn-body text-sm text-text-light mt-2">
        পৃষ্ঠা রিফ্রেশ করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।
      </p>
    </section>
  );
}

/** Error boundary with Bangla messaging for the customer storefront. */
export function CustomerErrorBoundary({
  children,
  sectionLabel,
}: CustomerErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<CustomerSectionFallback sectionLabel={sectionLabel} />}
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
