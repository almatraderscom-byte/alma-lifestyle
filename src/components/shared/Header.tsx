'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/shop/mock-data';
import { APP_CONFIG } from '@/lib/constants';
import { EASE_LUXURY, DURATION } from '@/lib/motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/products?sort=newest', label: 'New In' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-alma-border/60">
        <div className="bg-alma-ink text-alma-cream/90 text-center text-[11px] tracking-[0.08em] py-2 px-4">
          Complimentary Dhaka delivery over ৳3,000 · Cash on delivery
        </div>
        <div className="surface-glass">
          
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-16 sm:h-[4.25rem] items-center justify-between gap-4">
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

              <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href}>
                    {link.label}
                  </NavLink>
                ))}
                <div
                  className="relative"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-alma-ink/75 hover:text-alma-ink flex items-center gap-1.5 transition-colors"
                  >
                    Categories
                    <ChevronDown open={categoriesOpen} />
                  </button>
                  <AnimatePresence>
                    {categoriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DURATION.fast, ease: EASE_LUXURY }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[min(100vw,22rem)]"
                      >
                        <div className="bg-white border border-alma-border shadow-[var(--shadow-premium)] py-2 overflow-hidden">
                          {CATEGORIES.map((cat, i) => (
                            <motion.div
                              key={cat.slug}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, ease: EASE_LUXURY }}
                            >
                              <Link
                                href={`/products?category=${cat.slug}`}
                                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-alma-champagne transition-colors group"
                              >
                                <span>
                                  <span className="font-medium text-alma-ink group-hover:text-alma-gold transition-colors">
                                    {cat.name}
                                  </span>
                                  <span className="text-alma-muted text-xs ml-2">{cat.nameBn}</span>
                                </span>
                                <span className="text-[10px] text-alma-muted tracking-wider">{cat.productCount}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              
              <div className="flex items-center gap-3">
                <Link
                  href="/products"
                  className="hidden sm:block p-2 text-alma-ink/60 hover:text-alma-ink transition-colors"
                  aria-label="Search"
                >
                  <SearchIcon />
                </Link>
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] font-medium bg-alma-ink text-alma-cream hover:bg-alma-charcoal transition-colors duration-400"
                >
                  <CartIcon />
                  <span className="hidden sm:inline">Bag</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-alma-gold text-[10px] font-bold text-alma-ink px-1">
                    0
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden border-t border-alma-border/50 bg-alma-cream/90 backdrop-blur-sm">
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="shrink-0 px-4 py-1.5 text-[10px] uppercase tracking-[0.1em] border border-alma-border/70 bg-white/80 text-alma-ink"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-alma-obsidian/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: DURATION.normal, ease: EASE_LUXURY }}
              className="absolute left-0 top-0 bottom-0 w-[min(100%,20rem)] bg-alma-cream shadow-[var(--shadow-premium)] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-alma-border">
                <span className="font-display text-xl">{APP_CONFIG.name}</span>
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close">
                  <MenuIcon open />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, ease: EASE_LUXURY }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3.5 text-sm uppercase tracking-[0.14em] font-medium border-b border-alma-border/40"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <p className="pt-6 pb-2 text-[10px] uppercase tracking-[0.2em] text-alma-gold">Categories</p>
                {CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04, ease: EASE_LUXURY }}
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="block py-3 text-sm text-alma-muted hover:text-alma-ink"
                      onClick={() => setMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="p-5 border-t border-alma-border">
                <Link
                  href="/cart"
                  className="flex items-center justify-center w-full py-3.5 bg-alma-ink text-alma-cream text-xs uppercase tracking-[0.14em]"
                  onClick={() => setMenuOpen(false)}
                >
                  View bag (0)
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-alma-ink/75 hover:text-alma-ink transition-colors group"
    >
      {children}
      <span className="absolute bottom-1 left-5 right-5 h-px bg-alma-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}
