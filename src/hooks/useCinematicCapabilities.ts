'use client';

import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

export function useCinematicCapabilities() {
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const nav = navigator as Navigator & { connection?: NetworkInformation };
    const conn = nav.connection;
    const effectiveType = conn?.effectiveType;
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      setIsSlowConnection(true);
    }
    if (conn?.saveData) setSaveData(true);

    setIsReady(true);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const useVideo = useMemo(() => {
    if (reduced || isSlowConnection || saveData) return false;
    return true;
  }, [reduced, isSlowConnection, saveData]);

  return {
    reduced: !!reduced,
    isMobile,
    isSlowConnection,
    saveData,
    useVideo,
    isReady,
  };
}
