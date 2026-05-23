'use client';

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
  if (!isUsableImageUrl(src)) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn('object-cover', className)}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      unoptimized={src.startsWith('data:')}
    />
  );
}
