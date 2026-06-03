'use client';

import { CustomCursor } from '@/components/cinematic/CustomCursor';
import { ScrollProgressBar } from '@/components/cinematic/ScrollProgressBar';

/** Global cinematic UI chrome (cursor + scroll progress). */
export function CinematicGlobalChrome() {
  return (
    <>
      <ScrollProgressBar />
      <CustomCursor />
    </>
  );
}
