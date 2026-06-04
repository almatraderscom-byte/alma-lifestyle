import { cn } from '@/lib/utils';

export function AlmaSkeletonMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-mustard/20 text-xs font-semibold text-mustard animate-pulse',
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
        'rounded-sm bg-[#ebe3d6]',
        shimmer && 'skeleton-shimmer',
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <SkeletonBlock className={cn('h-3', className)} />;
}
