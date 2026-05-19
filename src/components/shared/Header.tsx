'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/shop/mock-data';
import { APP_CONFIG } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/products', label: 'Shop All' },
  { href: '/collections', label: 'Collections' },
  { href: '/products?sort=newest', label: 'New Arrivals' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-alma-cream/95 backdrop-blur-md border-b border-alma-border">
      <div className="border-b border-alma-border/60 bg-alma-ink text-alma-cream text-center text-xs py-2 px-4">
        Free delivery in Dhaka on orders over ৳3,000 · Cash on delivery available
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-alma-ink"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MenuIcon open={menuOpen} />
          </button>

          <Link
            href="/"
            className="font-display text-xl sm:text-2xl tracking-tight text-alma-ink shrink-0"
          >
            {APP_CONFIG.name}
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-alma-ink/80 hover:text-alma-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                className="px-4 py-2 text-sm text-alma-ink/80 hover:text-alma-ink flex items-center gap-1"
              >
                Categories
                <ChevronDown />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-0 pt-1 w-56">
                  <div className="bg-white border border-alma-border shadow-lg rounded-sm py-2">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-alma-cream transition-colors"
                      >
                        <span>
                          {cat.name}{' '}
                          <span className="text-alma-muted text-xs">
                            ({cat.nameBn})
                          </span>
                        </span>
                        <span className="text-alma-muted text-xs">
                          {cat.productCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              className="hidden sm:flex p-2 text-alma-ink/70 hover:text-alma-ink"
              aria-label="Search products"
            >
              <SearchIcon />
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-alma-ink text-alma-cream rounded-sm hover:bg-alma-ink/90 transition-colors"
            >
              <CartIcon />
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -top-1 -right-1 sm:static sm:ml-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-alma-gold text-[10px] font-bold text-alma-ink px-1">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:hidden border-t border-alma-border overflow-x-auto">
        <div className="flex gap-2 px-4 py-2.5 min-w-max">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="shrink-0 rounded-full border border-alma-border bg-white px-3.5 py-1.5 text-xs font-medium text-alma-ink hover:border-alma-ink/30 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-alma-border bg-white">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-sm font-medium border-b border-alma-border/50"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-3 pb-1 text-xs uppercase tracking-wider text-alma-muted">
              Categories
            </p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="py-2.5 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name} · {cat.nameBn}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M6 6L5 3H2" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
