import { AlmaSkeletonMark, SkeletonBlock, SkeletonLine } from '@/components/cinematic/CinematicSkeleton';

export default function ProductDetailLoading() {
  return (
    <div className="relative min-h-screen bg-warm-white px-4 py-8 lg:px-12">
      <div className="absolute right-4 top-4">
        <AlmaSkeletonMark />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-[60%]">
          <SkeletonBlock className="aspect-[3/4] max-h-[800px] w-full" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-[40%]">
          <SkeletonBlock className="h-10 w-4/5" />
          <SkeletonBlock className="h-8 w-1/3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLine key={i} className={i % 2 === 0 ? 'w-full' : 'w-5/6'} />
          ))}
          <SkeletonBlock className="mt-6 h-12 w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
}
