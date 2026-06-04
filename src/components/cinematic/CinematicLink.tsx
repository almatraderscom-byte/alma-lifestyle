'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CinematicLinkProps extends React.ComponentProps<typeof Link> {
  fadeOutMs?: number;
}

export const CinematicLink = forwardRef<HTMLAnchorElement, CinematicLinkProps>(function CinematicLink(
  { href, onClick, children, className, fadeOutMs = 300, ...rest },
  ref
) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (reduced) return;

      if (typeof href !== 'string') return;
      if (!href.startsWith('/') || href.startsWith('//')) return;

      e.preventDefault();
      setLeaving(true);
      window.setTimeout(() => {
        router.push(href);
      }, fadeOutMs);
    },
    [fadeOutMs, href, onClick, reduced, router]
  );

  return (
    <Link
      ref={ref}
      href={href}
      onClick={handleClick}
      className={cn(leaving && 'pointer-events-none opacity-80', className)}
      {...rest}
    >
      {children}
    </Link>
  );
});
