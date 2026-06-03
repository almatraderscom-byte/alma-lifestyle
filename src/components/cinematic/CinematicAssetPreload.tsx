'use client';

import { useEffect } from 'react';
import { CINEMATIC_HERO } from '@/lib/cinematic-config';

/** Injects hero preload links when desktop + fast connection. */
export function CinematicAssetPreload() {
  useEffect(() => {
    const poster = document.createElement('link');
    poster.rel = 'preload';
    poster.as = 'image';
    poster.href = CINEMATIC_HERO.posterSrc;
    document.head.appendChild(poster);

    const isMobile = window.innerWidth < 768;
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    const conn = nav.connection?.effectiveType;
    const isSlow = conn === '2g' || conn === 'slow-2g';

    if (!isMobile && !isSlow) {
      const video = document.createElement('link');
      video.rel = 'preload';
      video.as = 'video';
      video.href = CINEMATIC_HERO.videoSrc;
      document.head.appendChild(video);
    }

    return () => {
      poster.remove();
    };
  }, []);

  return null;
}
