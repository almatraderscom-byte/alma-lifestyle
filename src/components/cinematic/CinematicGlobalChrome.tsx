'use client';

import { CustomCursor } from '@/components/cinematic/CustomCursor';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';
import { ParticleAtmosphere } from '@/components/cinematic/ParticleAtmosphere';
import { CinematicImageRevealInit } from '@/components/cinematic/CinematicImageRevealInit';

/** Global cinematic UI chrome (cursor + scroll progress). */
export function CinematicGlobalChrome() {
  return (
    <>
      <ParticleAtmosphere />
      <ScrollProgressBar />
      <CinematicImageRevealInit />
      <CustomCursor />
    </>
  );
}
