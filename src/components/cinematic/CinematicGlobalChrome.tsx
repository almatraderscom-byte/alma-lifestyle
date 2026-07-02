'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';
import { RouteTransitionBar } from '@/components/cinematic/RouteTransitionBar';
import { CinematicImageRevealInit } from '@/components/cinematic/CinematicImageRevealInit';
import { isEmbedPreviewMode } from '@/lib/homepage-config';
import { isObsidianChromeRoute } from '@/lib/storefront/obsidian-routes';

const ParticleAtmosphere = dynamic(
  () => import('@/components/cinematic/ParticleAtmosphere').then((m) => m.ParticleAtmosphere),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import('@/components/cinematic/CustomCursor').then((m) => m.CustomCursor),
  { ssr: false }
);

function isInsideIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Global cinematic UI chrome (cursor + scroll progress + route transitions). */
export function CinematicGlobalChrome() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isInsideIframe() || isEmbedPreviewMode()) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;
  // The admin panel ships its own lightweight cursor comet (AdminCursorComet) and
  // must never run the legacy CustomCursor / ParticleAtmosphere / progress bars.
  if (pathname?.startsWith('/admin')) return null;
  // Every Obsidian-chrome route (the homepage AND every reskinned sub-page) ships
  // its own cursor comet + particle/ripple field via ObsidianFX. The legacy
  // cinematic chrome (CustomCursor, ParticleAtmosphere, RouteTransitionBar, etc.)
  // must NOT run on any of them — otherwise two mouse effects overlap and two
  // route bars stack. Keep only the Obsidian FX there; legacy chrome remains for
  // any not-yet-migrated storefront route (e.g. /collections, /new, /wishlist).
  if (isObsidianChromeRoute(pathname)) return null;

  return (
    <>
      <Suspense fallback={null}>
        <RouteTransitionBar />
      </Suspense>
      <ParticleAtmosphere />
      <ScrollProgressBar />
      <CinematicImageRevealInit />
      <CustomCursor />
    </>
  );
}
