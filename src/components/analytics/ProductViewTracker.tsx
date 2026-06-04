'use client';

import { useEffect } from 'react';
import { fbPixel } from '@/lib/analytics/fb-pixel';

export function ProductViewTracker({
  slug,
  price,
  title,
}: {
  slug: string;
  price: number;
  title: string;
}) {
  useEffect(() => {
    fbPixel.track('ViewContent', {
      content_ids: [slug],
      content_name: title,
      content_type: 'product',
      value: price,
      currency: 'BDT',
    });
  }, [slug, price, title]);

  return null;
}
