import { formatBnText } from '@/lib/format-bn';
import type { TrustSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

interface TrustStripProps {
  data?: TrustSectionData;
}

export function TrustStrip({ data: dataProp }: TrustStripProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'trust')!.data;

  return (
    <section className="section-padding bg-cream border-t border-border-subtle">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {data.items.map((item) => (
          <div key={item.id} className="text-center md:text-left">
            <span className="text-3xl md:text-4xl" aria-hidden>
              {item.icon}
            </span>
            <h3 className="font-bn-heading text-lg md:text-xl font-bold text-charcoal mt-3">
              {item.title}
            </h3>
            <p className="font-bn-body text-sm text-text-light mt-1">{formatBnText(item.text)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
