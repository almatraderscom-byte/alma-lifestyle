'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { forwardRef, useCallback } from 'react';
import { dispatchRouteTransitionStart } from '@/components/cinematic/RouteTransitionBar';
import { dispatchHomeNavigationStart } from '@/lib/cinematic-navigation';
import { haptic } from '@/lib/haptic';
import { cn } from '@/lib/utils';

type CinematicHomeLinkProps = React.ComponentProps<typeof Link>;

export const CinematicHomeLink = forwardRef<HTMLAnchorElement, CinematicHomeLinkProps>(
  function CinematicHomeLink({ href = '/', onClick, children, className, ...rest }, ref) {
    const pathname = usePathname();
    const router = useRouter();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        haptic.light();

        if (pathname === '/') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

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
        dispatchHomeNavigationStart();
        dispatchRouteTransitionStart();
        router.push('/');
      },
      [onClick, pathname, rest.target, router]
    );

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        data-cursor-attract=""
        className={cn('group transition-transform duration-300 active:scale-[0.97]', className)}
        {...rest}
      >
        {children}
      </Link>
    );
  }
);
