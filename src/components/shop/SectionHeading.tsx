import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  className,
}: SectionHeadingProps) {
  return (
    
    <div
      className={cn(
        'flex items-end justify-between gap-4 mb-4 sm:mb-5',
        className
      )}
    >
      <div>
        <h2 className="font-display text-xl sm:text-2xl text-alma-ink tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-alma-muted">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-alma-ink underline underline-offset-4 hover:text-alma-gold transition-colors"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
