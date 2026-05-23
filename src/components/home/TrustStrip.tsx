import { TRUST_STRIP } from '@/lib/content';

export function TrustStrip() {
  return (
    <section className="bg-cream border-t border-border-subtle py-12 md:py-16 px-6 md:px-12">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {TRUST_STRIP.map((item) => (
          <div key={item.title} className="text-center md:text-left">
            <span className="text-3xl md:text-4xl" aria-hidden>
              {item.icon}
            </span>
            <h3 className="font-bn-heading text-lg md:text-xl font-bold text-charcoal mt-3">
              {item.title}
            </h3>
            <p className="font-bn-body text-sm text-text-light mt-1">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
