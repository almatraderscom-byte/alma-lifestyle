'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useCinematicCapabilities() {
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    const conn = nav.connection?.effectiveType;
    if (conn === '2g' || conn === 'slow-2g') setIsSlowConnection(true);

    setIsReady(true);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    reduced: !!reduced,
    isMobile,
    isSlowConnection,
    /** Video when desktop + capable; `isReady` only gates layout, not video eligibility */
    useVideo: !isMobile && !isSlowConnection && !reduced,
    isReady,
  };
}
