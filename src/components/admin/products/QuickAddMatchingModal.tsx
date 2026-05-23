'use client';

import Link from 'next/link';
import { Button } from '@/components/admin/ui/Button';
import type { ProductType } from '@/lib/product-design-types';

interface QuickAddMatchingModalProps {
  designGroupId: string;
  designGroupName: string;
  menSlug: string;
  onDismiss: () => void;
}

const VARIANT_LINKS: {
  type: ProductType;
  label: string;
}[] = [
  { type: 'boy_panjabi', label: 'ছেলে version যোগ করুন' },
  { type: 'women_three_piece', label: 'মহিলা version যোগ করুন' },
  { type: 'girl_two_piece', label: 'মেয়ে version যোগ করুন' },
];

function buildNewProductHref(
  designGroupId: string,
  designGroupName: string,
  menSlug: string,
  productType: ProductType
): string {
  const params = new URLSearchParams({
    designGroupId,
    designGroupName,
    menSlug,
    productType,
  });
  return `/admin/products/new?${params.toString()}`;
}

export function QuickAddMatchingModal({
  designGroupId,
  designGroupName,
  menSlug,
  onDismiss,
}: QuickAddMatchingModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-matching-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-neutral-200">
        <h2
          id="quick-add-matching-title"
          className="text-lg font-semibold text-neutral-900 mb-2"
        >
          পণ্য সেভ হয়েছে!
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          <span className="font-medium">{designGroupName}</span> — এই ডিজাইনের আরও variant
          যোগ করতে চান?
        </p>
        <div className="flex flex-col gap-2">
          {VARIANT_LINKS.map(({ type, label }) => (
            <Link
              key={type}
              href={buildNewProductHref(designGroupId, designGroupName, menSlug, type)}
              className="block"
            >
              <Button type="button" variant="secondary" className="w-full justify-center">
                {label}
              </Button>
            </Link>
          ))}
          <Button type="button" className="w-full mt-2" onClick={onDismiss}>
            পরে করবো
          </Button>
        </div>
      </div>
    </div>
  );
}
