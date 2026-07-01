import { cn } from '@/lib/utils';

export function AlmaSkeletonMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-[#7c5cff]/20 text-xs font-semibold text-[#9a7dff] animate-pulse',
        className
      )}
      aria-hidden
    >
      A
    </div>
  );
}

export function SkeletonBlock({
  className,
  shimmer = true,
}: {
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-sm bg-[#1b1826] animate-pulse',
        shimmer && 'skeleton-shimmer',
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <SkeletonBlock className={cn('h-3', className)} />;
}
