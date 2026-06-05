'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';
import { RouteTransitionBar } from '@/components/cinematic/RouteTransitionBar';
import { HomeNavigationOverlay } from '@/components/cinematic/HomeNavigationOverlay';
import { CinematicImageRevealInit } from '@/components/cinematic/CinematicImageRevealInit';
import { isEmbedPreviewMode } from '@/lib/homepage-config';

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

  useEffect(() => {
    if (isInsideIframe() || isEmbedPreviewMode()) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Suspense fallback={null}>
        <RouteTransitionBar />
      </Suspense>
      <HomeNavigationOverlay />
      <ParticleAtmosphere />
      <ScrollProgressBar />
      <CinematicImageRevealInit />
      <CustomCursor />
    </>
  );
}
