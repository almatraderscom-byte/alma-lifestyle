/** Shared ALMA-branded loading state for route-level `loading.tsx` files.
 *  Self-contained (renders OUTSIDE the `.obsidian-home` scope), so all styling +
 *  keyframes are inlined here. A cinematic dark stage: an orbiting violet→gold
 *  ring around the ALMA mark, a shimmering wordmark and a soft breathing glow —
 *  premium enough that a short wait feels intentional rather than a dead pause. */
export function AlmaBrandedLoader({ className }: { className?: string }) {
  return (
    <div
      className={`relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 ${className ?? ''}`}
      style={{
        background:
          'radial-gradient(120% 90% at 50% -10%, #1a1530 0%, #0b0a12 58%, #08070d 100%)',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <style>{`
        @keyframes abl-spin { to { transform: rotate(360deg); } }
        @keyframes abl-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes abl-breathe {
          0%,100% { opacity: .45; transform: scale(1); }
          50%     { opacity: .9;  transform: scale(1.14); }
        }
        @keyframes abl-shimmer {
          0%   { background-position: -180% 0; }
          100% { background-position: 180% 0; }
        }
        @keyframes abl-dot {
          0%,100% { opacity: .3; transform: translateY(0); }
          50%     { opacity: 1;  transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .abl-ring, .abl-ring2, .abl-glow, .abl-dot, .abl-word { animation: none !important; }
        }
      `}</style>

      {/* breathing aura */}
      <div
        className="abl-glow pointer-events-none absolute h-72 w-72 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(124,92,255,0.45) 0%, rgba(124,92,255,0) 68%)',
          filter: 'blur(20px)',
          animation: 'abl-breathe 3.2s ease-in-out infinite',
        }}
        aria-hidden
      />

      <div className="relative text-center">
        {/* orbiting rings around the mark */}
        <div className="relative mx-auto mb-7 h-24 w-24" aria-hidden>
          <div
            className="abl-ring absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, #7c5cff 90deg, #b25cff 200deg, #d8a94e 300deg, transparent 360deg)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
              animation: 'abl-spin 1.5s linear infinite',
            }}
          />
          <div
            className="abl-ring2 absolute inset-[10px] rounded-full"
            style={{
              background:
                'conic-gradient(from 180deg, transparent 0deg, #d8a94e 120deg, transparent 300deg)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
              animation: 'abl-spin-rev 2.4s linear infinite',
            }}
          />
          {/* centre mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              style={{
                fontFamily: 'var(--font-archivo), sans-serif',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '0.04em',
                color: '#f4f0ff',
                textShadow: '0 0 14px rgba(124,92,255,0.7)',
              }}
            >
              A
            </span>
          </div>
        </div>

        {/* shimmering wordmark */}
        <h2
          className="abl-word text-4xl tracking-[0.18em] md:text-5xl"
          style={{
            fontFamily: 'var(--font-playfair), serif',
            backgroundImage:
              'linear-gradient(100deg, #cdb8ff 0%, #ffffff 38%, #f2d79a 52%, #ffffff 66%, #cdb8ff 100%)',
            backgroundSize: '220% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'abl-shimmer 2.6s linear infinite',
          }}
        >
          ALMA
        </h2>
        <p
          className="mt-2 text-xs uppercase tracking-[0.35em]"
          style={{ color: 'rgba(224, 236, 255, 0.5)' }}
        >
          Lifestyle
        </p>

        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="abl-dot h-1.5 w-1.5 rounded-full"
              style={{
                background: i === 2 ? '#d8a94e' : '#7c5cff',
                animation: `abl-dot 1.1s ease-in-out ${i * 160}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
