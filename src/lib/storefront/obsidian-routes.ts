/**
 * Single source of truth for which storefront routes ship the Obsidian chrome
 * (their own `ObsidianShell` header/footer/marquee) and therefore must run the
 * global `RootShell` in chromeless mode to avoid a doubled header/footer.
 *
 * As each sub-page is migrated onto the Obsidian design language, add its route
 * here. The homepage ('/') is always included — it renders its own chrome too.
 */

/**
 * Exact routes that render their own Obsidian chrome. Add a route here only
 * once its page has actually been wrapped in `ObsidianShell` — otherwise it
 * would run chromeless with no header/footer at all.
 */
const OBSIDIAN_EXACT = new Set<string>([
  '/',
  '/products',
  '/about',
  '/contact',
  '/delivery',
  '/refund',
  '/privacy',
  '/terms',
  '/size-guide',
  '/faq',
  '/track',
  '/cart',
  '/checkout',
  '/checkout/confirmation',
  '/login',
  '/signup',
  '/forgot-password',
  '/account',
]);

/** Route prefixes whose entire subtree renders Obsidian chrome. */
const OBSIDIAN_PREFIXES = ['/products/'];

/** True when the given pathname renders its own Obsidian chrome. */
export function isObsidianChromeRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (OBSIDIAN_EXACT.has(pathname)) return true;
  return OBSIDIAN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** True when the route is the Obsidian homepage (which stays overlay-free). */
export function isHomeRoute(pathname: string | null | undefined): boolean {
  return pathname === '/';
}
