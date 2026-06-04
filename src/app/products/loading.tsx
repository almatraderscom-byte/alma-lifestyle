import { AlmaSkeletonMark, SkeletonBlock, SkeletonLine } from '@/components/cinematic/CinematicSkeleton';

export default function ProductsLoading() {
  return (
    <div className="relative min-h-screen bg-warm-white px-4 py-8 lg:px-8">
      <div className="absolute right-4 top-4 lg:right-8 lg:top-8">
        <AlmaSkeletonMark />
      </div>

      <SkeletonBlock className="mb-6 h-8 w-48 max-w-full" />
      <SkeletonLine className="mb-10 w-64 max-w-full" />

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 space-y-3 lg:w-56">
          {['w-full', 'w-4/5', 'w-3/5', 'w-full', 'w-2/3', 'w-4/5'].map((w, i) => (
            <SkeletonLine key={i} className={w} />
          ))}
        </aside>

        <div className="flex-1">
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-sm border border-border-subtle bg-cream/40 p-3">
                <SkeletonBlock className="aspect-[3/4] w-full" />
                <SkeletonLine className="w-4/5" />
                <SkeletonLine className="w-1/2" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
