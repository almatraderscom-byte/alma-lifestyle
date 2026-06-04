'use client';

import { cn } from '@/lib/utils';

interface CinematicModeBannerProps {
  variant: 'sections-hero' | 'cinematic-tab';
  cinematicOn: boolean;
  className?: string;
}

export function CinematicModeBanner({
  variant,
  cinematicOn,
  className,
}: CinematicModeBannerProps) {
  const status = cinematicOn ? 'ON' : 'OFF';

  if (variant === 'sections-hero') {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-[#C97D5D] bg-[#FAFAFA] px-3 py-2.5 text-sm text-neutral-900',
          className
        )}
        role="note"
      >
        <p className="font-semibold text-neutral-900">⚙️ Cinematic mode is currently {status}.</p>
        <p className="mt-1 text-neutral-700">
          When ON, edit hero copy in the <strong>Cinematic</strong> tab. This editor controls the
          editorial fallback only.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-[#C97D5D] bg-[#FAFAFA] px-3 py-2.5 text-sm text-neutral-900',
        className
      )}
      role="note"
    >
      <p className="font-semibold text-neutral-900">📝 These fields apply when Cinematic mode is ON.</p>
      <p className="mt-1 text-neutral-700">
        Current status: <strong>{status}</strong>. Toggle in Settings → Homepage.
      </p>
    </div>
  );
}
