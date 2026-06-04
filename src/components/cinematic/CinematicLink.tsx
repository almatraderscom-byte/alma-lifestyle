'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dispatchRouteTransitionStart } from '@/components/cinematic/RouteTransitionBar';
import { haptic } from '@/lib/haptic';

interface CinematicLinkProps extends React.ComponentProps<typeof Link> {
  /** @deprecated Route bar provides feedback; kept for API compat */
  fadeOutMs?: number;
  hapticOnClick?: boolean;
}

export const CinematicLink = forwardRef<HTMLAnchorElement, CinematicLinkProps>(function CinematicLink(
  {
    href,
    onClick,
    children,
    className,
    hapticOnClick = true,
    prefetch = true,
    ...rest
  },
  ref
) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      if (hapticOnClick) haptic.light();

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'cinematic-link-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      target.style.position = target.style.position || 'relative';
      target.style.overflow = 'hidden';
      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);

      if (typeof href !== 'string') return;
      if (!href.startsWith('/') || href.startsWith('//')) return;

      dispatchRouteTransitionStart();

      if (reduced) return;

      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        rest.target === '_blank'
      ) {
        return;
      }

      e.preventDefault();
      router.push(href);
    },
    [href, hapticOnClick, onClick, reduced, rest.target, router]
  );

  return (
    <Link
      ref={ref}
      href={href}
      prefetch={prefetch}
      onClick={handleClick}
      data-cursor-attract=""
      className={cn(className)}
      {...rest}
    >
      {children}
    </Link>
  );
});
