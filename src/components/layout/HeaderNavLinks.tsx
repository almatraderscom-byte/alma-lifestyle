'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHeaderNavItems } from '@/context/NavMenuContext';

export function HeaderNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navItems = useHeaderNavItems();

  const currentHref =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  function isNavActive(href: string) {
    if (href.includes('?')) return currentHref === href;
    const base = href.split('?')[0];
    if (base === '/products' && href === '/products') {
      return pathname === '/products' && !searchParams.get('sort');
    }
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  return (
    <nav className="hidden md:flex items-center gap-8" aria-label="প্রধান মেনু">
      {navItems.map((item) => {
        const active = isNavActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'link-underline font-bn-body text-base font-medium text-text-dark hover:text-accent transition-colors',
              active && 'text-accent'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
