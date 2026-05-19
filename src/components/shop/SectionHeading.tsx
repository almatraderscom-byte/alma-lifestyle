import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  dark?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = 'Explore all',
  className,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-end justify-between gap-6 mb-8 sm:mb-10', className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'h-px w-8 sm:w-12',
              dark ? 'bg-alma-gold-light' : 'bg-alma-gold'
            )}
            aria-hidden
          />
          <span
            className={cn(
              'text-[10px] uppercase tracking-[0.2em] font-medium',
              dark ? 'text-alma-gold-light' : 'text-alma-gold'
            )}
          >
            Alma Lifestyle
          </span>
        </div>
        <h2
          className={cn(
            'font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.15]',
            dark ? 'text-alma-cream' : 'text-alma-ink'
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'text-sm sm:text-base max-w-lg leading-relaxed',
              dark ? 'text-alma-cream/70' : 'text-alma-muted'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            'shrink-0 group flex items-center gap-2 text-xs uppercase tracking-[0.14em] font-medium transition-colors',
            dark
              ? 'text-alma-gold-light hover:text-alma-cream'
              : 'text-alma-ink hover:text-alma-gold'
          )}
        >
          {linkLabel}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
