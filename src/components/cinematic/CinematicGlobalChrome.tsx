'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';
import { RouteTransitionBar } from '@/components/cinematic/RouteTransitionBar';
import { CinematicImageRevealInit } from '@/components/cinematic/CinematicImageRevealInit';

const ParticleAtmosphere = dynamic(
  () => import('@/components/cinematic/ParticleAtmosphere').then((m) => m.ParticleAtmosphere),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import('@/components/cinematic/CustomCursor').then((m) => m.CustomCursor),
  { ssr: false }
);

/** Global cinematic UI chrome (cursor + scroll progress + route transitions). */
export function CinematicGlobalChrome() {
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
