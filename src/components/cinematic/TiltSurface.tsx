'use client';

import { cn } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';

interface TiltSurfaceProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function TiltSurface({ children, className, strength = 8 }: TiltSurfaceProps) {
  const ref = use3DTilt(strength);

  return (
    <div
      ref={ref}
      className={cn('[transform-style:preserve-3d]', className)}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </div>
  );
}
