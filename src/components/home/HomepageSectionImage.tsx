'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isUsableImageUrl } from '@/lib/homepage-image';
import { cn } from '@/lib/utils';

interface HomepageSectionImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function HomepageSectionImage({
  src,
  alt,
  className,
  fill = true,
  priority = false,
  sizes = '100vw',
}: HomepageSectionImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isUsableImageUrl(src) || failed) return null;

  if (src.startsWith('data:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill ? 'absolute inset-0 h-full w-full object-cover' : 'w-full h-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn('object-cover', className)}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        console.error('[Homepage] Image failed to load:', src);
        setFailed(true);
      }}
    />
  );
}
