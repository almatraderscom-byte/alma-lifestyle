'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/pixel';

export function ProductViewTracker({
  productId,
  price,
  title,
}: {
  productId: string;
  price: number;
  title: string;
}) {
  useEffect(() => {
    trackViewContent({
      content_id: productId,
      content_name: title,
      value: price,
      currency: 'BDT',
      content_type: 'product',
    });
  }, [productId, price, title]);

  return null;
}
