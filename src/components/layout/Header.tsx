'use client';

import Link from 'next/link';
import { CinematicLink } from '@/components/cinematic/CinematicLink';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCOUNT, AUTH, HEADER, MOBILE_NAV_ICONS, NAV, UI } from '@/lib/content';
import { useHeaderCategoryItems } from '@/context/NavMenuContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function IconButton({
  className,
  title,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string }) {
  return (
    <button
      type="button"
      title={title}
      className={cn(
        'relative rounded-full p-2 text-charcoal transition-colors hover:bg-cream',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function IconLink({
  href,
  title,
  className,
  children,
  onClick,
}: {
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'relative rounded-full p-2 text-charcoal transition-colors hover:bg-cream',
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categories = useHeaderCategoryItems();
  const { itemCount, hydrated: cartHydrated } = useCart();
  const { count: wishlistCount, hydrated: wishHydrated } = useWishlist();
  const cartCount = cartHydrated ? itemCount : 0;
  const wishCount = wishHydrated ? wishlistCount : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCategoriesOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  function navLinkClass(active: boolean) {
    return cn(
      'whitespace-nowrap px-3 py-2 text-sm font-medium text-charcoal transition-colors hover:text-terracotta',
      active && 'text-terracotta'
    );
  }

  const shopActive =
    pathname === '/products' && searchParams.get('sort') !== 'newest' && !searchParams.get('category');
  const newActive = pathname === '/products' && searchParams.get('sort') === 'newest';
  const islamicActive =
    pathname === '/products' && searchParams.get('category') === 'islamic';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b bg-white transition-shadow duration-300',
          scrolled ? 'border-gray-100 shadow-md' : 'border-border-subtle shadow-none'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Mobile bar */}
          <div className="flex h-16 items-center justify-between lg:hidden">
            <button
              type="button"
              className="rounded-full p-2 text-charcoal hover:bg-cream"
              aria-label={HEADER.openMenu}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>

            <Link href="/" className="font-brand text-xl text-charcoal whitespace-nowrap">
              ALMA
            </Link>

            <div className="flex items-center gap-1">
              <IconLink href={MOBILE_NAV_ICONS.search.href} title={UI.search}>
                <Search className="h-5 w-5" aria-hidden />
              </IconLink>
              <IconLink href={MOBILE_NAV_ICONS.bag.href} title={UI.cart}>
                <ShoppingBag className="h-5 w-5" aria-hidden />
                <CountBadge count={cartCount} />
              </IconLink>
            </div>
          </div>

          {/* Desktop bar */}
          <div className="hidden h-20 items-center justify-between lg:flex">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-1" onClick={() => setMenuOpen(false)}>
                <span className="font-brand text-2xl tracking-wider text-charcoal whitespace-nowrap">
                  ALMA
                </span>
                <span className="font-brand mt-1 hidden text-xs text-text-light xl:inline whitespace-nowrap">
                  Lifestyle
                </span>
              </Link>
            </div>

            <nav
              className="mx-auto flex items-center gap-6 xl:gap-8"
              aria-label={HEADER.mainNav}
            >
              <CinematicLink href={NAV.shop.href} className={navLinkClass(shopActive)}>
                {NAV.shop.label}
              </CinematicLink>
              <CinematicLink href={NAV.newArrivals.href} className={navLinkClass(newActive)}>
                {NAV.newArrivals.label}
              </CinematicLink>

              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm font-medium text-charcoal transition-colors hover:text-terracotta"
                  aria-haspopup="true"
                >
                  {NAV.categoriesLabel}
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
                <div
                  className={cn(
                    'absolute left-0 top-full z-50 mt-2 w-52 rounded-md bg-white py-1 shadow-xl',
                    'invisible opacity-0 transition-all duration-200',
                    'group-hover:visible group-hover:opacity-100',
                    'group-focus-within:visible group-focus-within:opacity-100'
                  )}
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-3 text-sm text-charcoal transition-colors hover:bg-cream"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>

              <CinematicLink href={NAV.islamic.href} className={navLinkClass(islamicActive)}>
                <span className="inline-flex items-center">
                  <span
                    className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard"
                    aria-hidden
                  />
                  {NAV.islamic.label}
                </span>
              </CinematicLink>

              <CinematicLink href={NAV.about.href} className={navLinkClass(pathname === NAV.about.href)}>
                {NAV.about.label}
              </CinematicLink>
            </nav>

            <div className="flex flex-shrink-0 items-center gap-1 lg:gap-2">
              <IconLink href={MOBILE_NAV_ICONS.search.href} title={UI.search}>
                <Search className="h-5 w-5" aria-hidden />
              </IconLink>

              <IconLink href={MOBILE_NAV_ICONS.wishlist.href} title={UI.wishlist}>
                <Heart className="h-5 w-5" aria-hidden />
                <CountBadge count={wishCount} />
              </IconLink>

              <IconLink href={MOBILE_NAV_ICONS.bag.href} title={UI.cart}>
                <ShoppingBag className="h-5 w-5" aria-hidden />
                <CountBadge count={cartCount} />
              </IconLink>

              <div className="relative group">
                <IconButton title={UI.myAccount} aria-label={UI.myAccount}>
                  <User className="h-5 w-5" aria-hidden />
                </IconButton>
                <div
                  className={cn(
                    'absolute right-0 top-full z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-xl',
                    'invisible opacity-0 transition-all duration-200',
                    'group-hover:visible group-hover:opacity-100',
                    'group-focus-within:visible group-focus-within:opacity-100'
                  )}
                >
                  {loggedIn ? (
                    <>
                      <Link
                        href="/account"
                        className="block px-4 py-3 text-sm text-charcoal hover:bg-cream"
                      >
                        {AUTH.account}
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-3 text-sm text-charcoal hover:bg-cream"
                      >
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-cream"
                      >
                        {ACCOUNT.logout}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-sm text-charcoal hover:bg-cream"
                      >
                        {AUTH.loginButton}
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-3 text-sm text-charcoal hover:bg-cream"
                      >
                        {AUTH.signUpButton}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={HEADER.closeMenu}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              aria-label={HEADER.mobileMenu}
            >
              <div className="flex items-center justify-between border-b border-border-subtle p-4">
                <span className="font-brand text-2xl text-charcoal">ALMA</span>
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-cream"
                  aria-label={HEADER.closeMenu}
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="h-6 w-6" aria-hidden />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <Link
                  href={NAV.shop.href}
                  className="block py-3 text-lg font-bn-heading text-charcoal"
                  onClick={() => setMenuOpen(false)}
                >
                  {NAV.shop.label}
                </Link>
                <Link
                  href={NAV.newArrivals.href}
                  className="block py-3 text-lg font-bn-heading text-charcoal"
                  onClick={() => setMenuOpen(false)}
                >
                  {NAV.newArrivals.label}
                </Link>

                <div className="mt-2 border-t border-border-subtle pt-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-sm font-medium text-text-light"
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    aria-expanded={mobileCategoriesOpen}
                  >
                    {NAV.categoriesLabel}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        mobileCategoriesOpen && 'rotate-180'
                      )}
                      aria-hidden
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <ul className="pb-2 pl-2">
                      {categories.map((cat) => (
                        <li key={cat.href}>
                          <Link
                            href={cat.href}
                            className="block py-2 pl-2 text-base text-charcoal"
                            onClick={() => setMenuOpen(false)}
                          >
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Link
                  href={NAV.islamic.href}
                  className="flex min-h-[48px] items-center py-3 text-lg font-bn-heading text-charcoal"
                  onClick={() => setMenuOpen(false)}
                >
                  {NAV.islamic.label}
                </Link>

                <div className="mt-2 border-t border-border-subtle pt-2">
                  <Link
                    href={NAV.about.href}
                    className="block py-3 text-lg font-bn-heading text-charcoal"
                    onClick={() => setMenuOpen(false)}
                  >
                    {NAV.about.label}
                  </Link>
                  <Link
                    href="/track"
                    className="block py-3 font-bn-body text-charcoal"
                    onClick={() => setMenuOpen(false)}
                  >
                    {UI.trackOrder}
                  </Link>
                  {loggedIn ? (
                    <>
                      <Link
                        href="/account"
                        className="block py-3 font-bn-body text-charcoal"
                        onClick={() => setMenuOpen(false)}
                      >
                        {AUTH.account}
                      </Link>
                      <button
                        type="button"
                        className="block py-3 text-left font-bn-body text-red-600"
                        onClick={() => void handleLogout()}
                      >
                        {ACCOUNT.logout}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block py-3 font-bn-body text-charcoal"
                      onClick={() => setMenuOpen(false)}
                    >
                      {AUTH.loginButton}
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-border-subtle pt-4">
                  <IconLink
                    href={MOBILE_NAV_ICONS.wishlist.href}
                    title={UI.wishlist}
                    className="flex-1 justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" aria-hidden />
                    <CountBadge count={wishCount} />
                  </IconLink>
                  <IconLink
                    href={MOBILE_NAV_ICONS.search.href}
                    title={UI.search}
                    className="flex-1 justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" aria-hidden />
                  </IconLink>
                </div>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
