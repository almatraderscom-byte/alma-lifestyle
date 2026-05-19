import Link from 'next/link';
import { APP_CONFIG } from '@/lib/constants';
import { CATEGORIES, COLLECTIONS } from '@/lib/shop/mock-data';

export function Footer() {
  return (
    <footer className="mt-auto gradient-dark text-alma-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          <div className="col-span-2 md:col-span-4">
            <p className="font-display text-2xl sm:text-3xl tracking-tight">{APP_CONFIG.name}</p>
            <p className="mt-4 text-sm text-alma-cream/65 leading-relaxed max-w-xs">
              A premium Bangladeshi fashion house — Punjabi elegance with world-class
              presentation and effortless shopping.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-alma-gold-light mb-4">Shop</h3>
            <ul className="space-y-2.5">
              <FooterLink href="/products">All products</FooterLink>
              <FooterLink href="/collections">Collections</FooterLink>
              <FooterLink href="/products?sort=newest">New in</FooterLink>
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-alma-gold-light mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <FooterLink href={`/products?category=${c.slug}`}>{c.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-alma-gold-light mb-4">Collections</h3>
            <ul className="space-y-2.5">
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <FooterLink href={`/collections/${c.slug}`}>{c.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-alma-cream/10 flex flex-col sm:flex-row justify-between gap-3 text-[11px] tracking-wide text-alma-cream/50">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}</p>
          <p>Prices in BDT · Crafted in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-alma-cream/70 hover:text-alma-gold-light transition-colors duration-300">
      {children}
    </Link>
  );
}
