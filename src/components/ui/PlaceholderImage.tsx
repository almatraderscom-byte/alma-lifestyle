import { cn } from '@/lib/utils';
import { getDefaultImageForHint } from '@/lib/default-images';

interface PlaceholderImageProps {
  hint: string;
  className?: string;
  bgClass?: string;
  textClassName?: string;
  defaultUrl?: string;
  /** Skip default image (show only colored box) */
  noDefault?: boolean;
}

/** Image with curated Unsplash default when no admin upload */
export function PlaceholderImage({
  hint,
  className,
  bgClass = 'bg-maroon',
  textClassName = 'text-white/60',
  defaultUrl,
  noDefault = false,
}: PlaceholderImageProps) {
  const imageUrl = noDefault ? null : defaultUrl || getDefaultImageForHint(hint);

  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={hint.replace(/^Image:\s*/i, '')}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative pattern-overlay overflow-hidden', bgClass, className)}>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center p-4 text-center',
          'font-bn-body text-[10px] sm:text-xs leading-snug max-w-[220px] mx-auto',
          textClassName
        )}
      >
        {hint}
      </span>
    </div>
  );
}
