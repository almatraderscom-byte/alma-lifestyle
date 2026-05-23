import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BREADCRUMB } from '@/lib/content';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="ব্রেডক্রাম্ব" className={cn('font-bn-body text-sm text-text-light', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-border-subtle select-none" aria-hidden>
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    isLast && 'text-primary font-medium',
                    !isLast && 'text-text-light'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && item.href ? (
                    <span className="inline-flex items-center gap-1">
                      <HomeIcon />
                      <span className="sr-only">{BREADCRUMB.home}</span>
                      <span aria-hidden>{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  {isFirst ? (
                    <>
                      <HomeIcon />
                      <span>{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    </svg>
  );
}
