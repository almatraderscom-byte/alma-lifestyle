import { AlmaSkeletonMark, SkeletonBlock, SkeletonLine } from '@/components/cinematic/CinematicSkeleton';

export default function CollectionsLoading() {
  return (
    <div className="relative min-h-screen bg-warm-white px-4 py-10 lg:px-12">
      <div className="absolute right-4 top-4">
        <AlmaSkeletonMark />
      </div>

      <SkeletonBlock className="mx-auto mb-4 h-10 w-64 max-w-full" />
      <SkeletonLine className="mx-auto mb-12 w-80 max-w-full" />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-border-subtle">
            <SkeletonBlock className="aspect-[16/10] w-full" />
            <div className="space-y-2 p-4">
              <SkeletonLine className="w-2/3" />
              <SkeletonLine className="w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
