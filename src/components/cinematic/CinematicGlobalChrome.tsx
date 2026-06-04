'use client';

import { Suspense } from 'react';
import { CustomCursor } from '@/components/cinematic/CustomCursor';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';
import { ParticleAtmosphere } from '@/components/cinematic/ParticleAtmosphere';
import { RouteTransitionBar } from '@/components/cinematic/RouteTransitionBar';
import { CinematicImageRevealInit } from '@/components/cinematic/CinematicImageRevealInit';

/** Global cinematic UI chrome (cursor + scroll progress). */
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
