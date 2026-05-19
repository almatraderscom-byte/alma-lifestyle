import { cn } from '@/lib/utils';

interface CatalogBannerProps {
  title: string;
  description?: string;
  count?: number;
  imageUrl?: string;
}

export function CatalogBanner({ title, description, count, imageUrl }: CatalogBannerProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-alma-border',
        imageUrl ? 'min-h-[200px] sm:min-h-[260px]' : 'gradient-hero'
      )}
    >
      {imageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-alma-obsidian/90 via-alma-obsidian/70 to-alma-obsidian/40" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-[10px] uppercase tracking-[0.22em] text-alma-gold mb-3">Alma Lifestyle</p>
        <h1
          className={cn(
            'font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl',
            imageUrl ? 'text-alma-cream' : 'text-alma-ink'
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              'mt-3 text-sm sm:text-base max-w-xl leading-relaxed',
              imageUrl ? 'text-alma-cream/75' : 'text-alma-muted'
            )}
          >
            {description}
          </p>
        )}
        {count !== undefined && (
          <p className={cn('mt-4 text-xs tracking-[0.14em] uppercase', imageUrl ? 'text-alma-gold-light' : 'text-alma-gold')}>
            {count} pieces
          </p>
        )}
      </div>
    </section>
  );
}
