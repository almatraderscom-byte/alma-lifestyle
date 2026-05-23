import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  hint: string;
  className?: string;
  bgClass?: string;
  textClassName?: string;
}

/** Colored placeholder with admin upload hint */
export function PlaceholderImage({
  hint,
  className,
  bgClass = 'bg-maroon',
  textClassName = 'text-white/60',
}: PlaceholderImageProps) {
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
