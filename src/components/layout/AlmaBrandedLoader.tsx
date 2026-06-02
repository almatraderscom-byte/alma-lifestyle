/** Shared ALMA-branded loading state for route-level `loading.tsx` files. */
export function AlmaBrandedLoader({ className }: { className?: string }) {
  return (
    <div
      className={`min-h-[50vh] bg-cream flex items-center justify-center px-4 ${className ?? ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="text-center">
        <h2
          className="font-brand text-charcoal text-4xl md:text-5xl tracking-wider"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          ALMA
        </h2>
        <p className="text-charcoal/60 text-xs tracking-[0.3em] uppercase mt-2">Lifestyle</p>

        <div className="flex gap-2 justify-center mt-6" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
          <span
            className="h-2 w-2 rounded-full bg-terracotta animate-pulse"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-terracotta animate-pulse"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
