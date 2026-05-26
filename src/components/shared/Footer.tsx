import Link from 'next/link';
import { APP_CONFIG } from '@/lib/constants';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';

const FOOTER_LINKS = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/collections', label: 'Collections' },
    { href: '/products?sort=newest', label: 'New Arrivals' },
  ],
  help: [
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
    { href: '/returns', label: 'Returns' },
  ],
};

export function Footer({ categories = [] }: { categories?: StorefrontNavCategory[] }) {
  return (
    <footer className="mt-auto border-t border-alma-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-xl text-alma-ink">{APP_CONFIG.name}</p>
            <p className="mt-2 text-sm text-alma-muted leading-relaxed">
              Premium Punjabi fashion for Bangladesh. Easy browsing, trusted quality,
              nationwide delivery.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-alma-ink mb-3">
              Shop
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-alma-muted hover:text-alma-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-alma-ink mb-3">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-alma-muted hover:text-alma-ink transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-alma-ink mb-3">
              Help
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-alma-muted hover:text-alma-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-alma-border flex flex-col sm:flex-row justify-between gap-2 text-xs text-alma-muted">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          <p>Prices in BDT · Cash on delivery · bKash coming soon</p>
        </div>
      </div>
    </footer>
  );
}

