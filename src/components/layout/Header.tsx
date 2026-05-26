'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SITE, NAV, MOBILE_NAV_ICONS, PRODUCTS_PAGE } from '@/lib/content';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';
import { HeaderNavLinks } from '@/components/layout/HeaderNavLinks';
import { useCart } from '@/context/CartContext';
import { toBanglaNumber } from '@/lib/format-bn';

const NAV_ITEMS = [NAV.shop, NAV.newArrivals, NAV.collections, NAV.about];

export function Header({ categories = [] }: { categories?: StorefrontNavCategory[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, hydrated } = useCart();
  const bagCount = hydrated ? itemCount : 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border-subtle">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-[4.5rem] md:px-6">
          <Link
            href="/"
            className="font-brand text-2xl font-semibold tracking-wide text-primary md:text-[1.75rem]"
            onClick={() => setMenuOpen(false)}
          >
            {SITE.brandName}
          </Link>

          <Suspense fallback={<div className="hidden md:block w-48 h-6 bg-secondary/50 rounded" aria-hidden />}>
            <HeaderNavLinks />
          </Suspense>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconLink
              href={MOBILE_NAV_ICONS.search.href}
              label={MOBILE_NAV_ICONS.search.label}
              icon={<SearchIcon />}
            />
            <IconLink
              href={MOBILE_NAV_ICONS.wishlist.href}
              label={MOBILE_NAV_ICONS.wishlist.label}
              icon={<HeartIcon />}
              className="hidden sm:flex"
            />
            <IconLink
              href={MOBILE_NAV_ICONS.bag.href}
              label={MOBILE_NAV_ICONS.bag.label}
              icon={<BagIcon count={bagCount} />}
            />

            <button
              type="button"
              className="md:hidden ml-1 p-2 -mr-2 text-primary"
              aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="absolute inset-0 bg-primary/50"
              aria-label="মেনু বন্ধ করুন"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.nav
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              aria-label="মোবাইল মেনু"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 h-16">
                <span className="font-brand text-xl text-primary">{SITE.brandName}</span>
                <button
                  type="button"
                  className="p-2 text-primary"
                  onClick={() => setMenuOpen(false)}
                  aria-label="বন্ধ করুন"
                >
                  <CloseIcon />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto px-4 py-4">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center min-h-12 py-3 px-2 font-bn-heading text-xl text-primary border-b border-border-subtle/60"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
                {categories.length > 0 && (
                  <>
                    <li className="pt-4 pb-1 px-2 font-bn-body text-sm font-semibold text-text-light">
                      {PRODUCTS_PAGE.categoriesTitle}
                    </li>
                    {categories.map((cat) => (
                      <motion.li
                        key={cat.slug}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="flex items-center min-h-11 py-2 px-2 font-bn-body text-base text-primary"
                          onClick={() => setMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      </motion.li>
                    ))}
                  </>
                )}
              </ul>
              <div className="grid grid-cols-3 gap-2 p-4 border-t border-border-subtle bg-warm-white">
                {Object.values(MOBILE_NAV_ICONS).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center min-h-12 py-2 text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="text-xs font-bn-body text-text-light">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconLink({
  href,
  label,
  icon,
  className,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center min-w-[52px] py-1 px-1 text-primary hover:text-accent transition-colors',
        className
      )}
    >
      {icon}
      <span className="font-bn-body text-[10px] md:text-xs text-text-light mt-0.5 leading-tight">
        {label}
      </span>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function BagIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6L5 3H2" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white px-1">
          {toBanglaNumber(count)}
        </span>
      )}
    </span>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
