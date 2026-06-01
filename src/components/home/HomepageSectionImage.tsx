'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/default-images';
import { isUsableImageUrl } from '@/lib/homepage-image';
import { cn } from '@/lib/utils';

interface HomepageSectionImageProps {
  src?: string | null;
  /** Used when admin URL is empty or load fails */
  fallbackSrc?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function HomepageSectionImage({
  src,
  fallbackSrc,
  alt,
  className,
  fill = true,
  priority = false,
  sizes = '100vw',
}: HomepageSectionImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(
    failed ? null : src,
    fallbackSrc ?? ''
  );

  if (!resolved) return null;

  if (resolved.startsWith('data:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className={cn(
          fill ? 'absolute inset-0 h-full w-full object-cover' : 'h-full w-full object-cover',
          className
        )}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      className={cn('object-cover', className)}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        if (fallbackSrc && src && isUsableImageUrl(src)) {
          setFailed(true);
        }
      }}
    />
  );
}
