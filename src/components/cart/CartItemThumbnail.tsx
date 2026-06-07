'use client';

import Image from 'next/image';
import { useState } from 'react';
import { resolveProductImageUrl } from '@/lib/default-images';
import { cn } from '@/lib/utils';

interface CartItemThumbnailProps {
  image: string;
  slug: string;
  title: string;
  className?: string;
}

export function CartItemThumbnail({
  image,
  slug,
  title,
  className,
}: CartItemThumbnailProps) {
  const [broken, setBroken] = useState(false);
  const src = resolveProductImageUrl(image, slug);

  if (!src || broken) {
    return (
      <div
        className={cn('shrink-0 rounded-lg bg-secondary', className)}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg bg-secondary',
        className
      )}
    >
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover"
        sizes="96px"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
