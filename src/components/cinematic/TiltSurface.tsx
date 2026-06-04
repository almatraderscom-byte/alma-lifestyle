'use client';

import { cn } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useTouchTilt } from '@/hooks/useTouchTilt';

interface TiltSurfaceProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function TiltSurface({ children, className, strength = 8 }: TiltSurfaceProps) {
  const desktopRef = use3DTilt(strength);
  const mobileRef = useTouchTilt(Math.max(4, strength - 2));

  return (
    <div
      ref={desktopRef}
      className={cn('[transform-style:preserve-3d]', className)}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <div
        ref={mobileRef}
        className="h-full w-full [transform-style:preserve-3d] md:pointer-events-none"
        style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {children}
      </div>
    </div>
  );
}
