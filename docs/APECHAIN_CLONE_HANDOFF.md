# HANDOFF — ApeChain-style immersive homepage for Alma Lifestyle

> Paste this whole file as the first message in a new session to continue exactly where we left off.

## 0) One-line task
Build Alma Lifestyle (a Bangladeshi **clothing / Panjabi** brand, Next.js 16 e-commerce repo) an
immersive homepage that clones the look & feel of **https://apechain.com/** as closely as possible —
all animations, spacing, transitions, interactions — using Alma's **real product data**, and give a
Vercel preview link.

## 1) Reference material (source of truth)
- Live site to clone: **https://apechain.com/** (⚠️ blocked from the agent sandbox: Cloudflare 403 +
  egress policy denies the host + WebFetch 403s + Wayback blocked. Work from screenshots instead.)
- Full-page screenshots the user provided (urlbox API — may also be blocked from sandbox, open in a real browser):
  - Dark full page: `https://api.urlbox.io/v1/ca482d7e-9417-4569-90fe-80f7c5e1c781/87d17afbc07be4e2d31b82445be469f1fe1d195aac4510ca17c9d6d9fc101fb2/webp?url=https%3A%2F%2Fapechain.com%2F&width=1440&height=1024&full_page=true&hide_cookie_banners=true&dark_mode=true`
  - Light PNG: `https://api.urlbox.io/v1/ca482d7e-9417-4569-90fe-80f7c5e1c781/0a796ff36835f47a21b2a80c070a1dd668caf6d35af6dc8d9abb9f56773ff2c0/png?url=https%3A%2F%2Fapechain.com%2F&width=1440&height=1024&hide_cookie_banners=true`
- What apechain.com actually looks like (from the screenshots): boxed "APECHAIN" logo top-left; centered
  nav EXPLORE / LEARN / BUILD / BRIDGE; **dark teal hero with concentric ripple-ring background** and a
  **3D fanned card carousel** of apps (featured card huge & centered, side cards tucked with strong
  perspective); big bold uppercase title overlapping the card bottom-left (e.g. "OTHERSIDE"), category
  tag (🔥 HOT / GAMES), "LAUNCH" pill, "SEE ALL APPS ▶", thumbnail strip + circular prev/next.
  Below: light "SPOTLIGHT" section with tilted 3D card; "APECHAIN APPS" product grid; a big blue category
  marquee with emoji/app icons + "BROWSE ALL APPS" button; blue footer with a giant "APECHAIN" wordmark.
- ApeChain brand palette (official): primary `#0054FA` (Blue Ribbon), `#006D8A` (Blue Lagoon), white.

## 2) The user's premium-experience brief (their exact words — target quality bar)
Tech stack asked for: Next.js 15 (App Router), TypeScript, Tailwind, GSAP + ScrollTrigger, Lenis
(smooth scroll), React Three Fiber + Drei, Framer Motion, Three.js post-processing (Bloom/Noise/Vignette).
Wants: dark immersive theme; fixed WebGL canvas behind content; smooth inertia scroll; every section fades
+ translates in on scroll; no abrupt transitions. Hero: fullscreen 100vh, floating 3D object, camera drifts
with mouse, staggered character animation on headline, magnetic-hover CTAs, particles + glow. Scroll: pin
briefly, text stagger, parallax bg objects, opacity/scale transitions. Nav: transparent → blur on scroll,
smooth anchors, mobile menu slides in with staggered items. WebGL: floating particles, animated gradients,
soft bloom, slight camera drift, mobile-optimized. Buttons: magnetic hover + glow + scale. Cards: tilt on
mouse move + shadow depth. Loading: custom preloader with 0–100 counter then reveal. Perf: efficient rAF,
pause WebGL offscreen, lazy-load, 60fps. Folder structure: /app /components /components/3d
/components/sections /lib/animations /hooks /public/models /public/textures. Goal: premium, cinematic,
luxurious, fluid, Awwwards-level. "Do not simplify the experience."
IMPORTANT nuance the user added later: their **main product is a clothing brand**, and they want the
homepage built with **their current site's data**, then a **Vercel preview link**.

## 3) What has been built so far (state as of this handoff)
- Branch: **`claude/apechain-website-clone-7xfbzf`** (repo `almatraderscom-byte/alma-lifestyle`, base `main`).
- PR: **#79** — https://github.com/almatraderscom-byte/alma-lifestyle/pull/79
- Vercel preview (Ready): demo at
  `https://alma-lifestyle-git-claude-apechain-web-1532e9-maruf-s-projects2.vercel.app/apechain-clone/`
  (root of that domain = the real current Alma site).
- Deliverable is a **self-contained static HTML** page served at `/apechain-clone/`, NOT yet the real
  React homepage. Files:
  - `public/apechain-clone/index.html` — generated output (do not hand-edit).
  - `scripts/apechain-demo.template.html` — the SOURCE template (edit this).
  - `scripts/build-apechain-demo.mjs` — generator: embeds product photos as base64 + inlines the JS libs.
  - `scripts/vendor/{gsap.min.js,ScrollTrigger.min.js,lenis.min.js}` — pinned libs, inlined (zero network).
  - Rebuild after editing template: `node scripts/build-apechain-demo.mjs`
- The demo currently includes: preloader (0→100, self-dismissing + CSS safety so it can NEVER freeze),
  dark-teal ripple + particle canvas hero, tight 3D product carousel (autoplay + thumbnails + prev/next),
  light spotlight w/ tilted card, product grid, Bengali category marquee, giant "ALMA LIFESTYLE" footer
  wordmark, magnetic buttons, tilt cards, mobile drawer. GSAP/Lenis are OPTIONAL polish — carousel/reveals/
  marquee run on plain CSS + IntersectionObserver + rAF so it works even if libs/JS are blocked.

## 4) Key audit findings (Alma repo)
- Homepage: `src/app/page.tsx` → `HomePageRenderer`; loads config via `getDefaultHomepageConfig()` and
  products via `loadCatalogProductsServer()` (`src/lib/storefront/server-data.ts`).
- Data: `src/lib/products-data.ts` → `CATALOG_PRODUCTS` (static fallback; type `CatalogProduct`).
  **Homepage renders WITHOUT Supabase** (static catalog) → Vercel preview builds with no secrets.
- Categories (Bengali labels): `panjabi` পাঞ্জাবি, `electronics` ইলেকট্রনিক্স, `accessories` এক্সেসরিজ,
  `home-decor` হোম ও ডেকর, `islamic` ইসলামিক. **Main clothing = Panjabi.**
- Real Panjabi products (slug, name, price৳, colorHex):
  royal-navy-panjabi রয়্যাল নেভি পাঞ্জাবি ৳2550 (was ৳3200) #2c3e5c;
  classic-white-panjabi ক্লাসিক সাদা পাঞ্জাবি ৳1850 #e8e4df;
  premium-cotton-panjabi প্রিমিয়াম কটন পাঞ্জাবি ৳2150 (৳2490) #8b7355;
  silk-premium-panjabi সিল্ক প্রিমিয়াম পাঞ্জাবি ৳3850 (৳4500) #4a5568;
  maroon-festive-panjabi মেরুন উৎসব পাঞ্জাবি ৳2950 #6b2c3e;
  green-casual-panjabi সবুজ ক্যাজুয়াল পাঞ্জাবি ৳1990 (৳2350) #4a7c59.
  Also electronics/accessories/home-decor + islamic (smart-murda-moshari ৳1790, jaynamaz set).
- ⚠️ **NO clothing photos in repo.** Panjabi products resolve to Alma SVG gradient placeholders
  (`src/lib/default-images.ts`). Only REAL photos: `public/products/murda-moshari/*.jpg`,
  `public/products/islamic/jaynamaz-*.jpg`, `islamic-7-books.jpg`. → Demo renders Panjabi as premium
  "fabric" gradient cards (colour + weave texture + mihrab motif). User CHOSE to keep fabric cards for now.
- Build guard: `scripts/check-no-demo-assets.ts` runs in `prebuild`/`predev` and **FAILS the build** if any
  `unsplash|picsum|placehold|demo-|test-|sample-` asset ref appears in `src/`. Never add those to `src/`.
- Design tokens (`src/app/globals.css`): warm brand — charcoal `#2a2622`, cream `#f5ebdd`, terracotta
  `#c97d5d`, maroon `#6b2737`, mustard `#c89b3c`, emerald `#2d5f4f`. Fonts (`src/app/layout.tsx`):
  Playfair Display (`--font-playfair`), Noto Serif Bengali, Hind Siliguri (Bengali body). Tailwind v4 + PostCSS.
- Root `src/app/layout.tsx` wraps EVERY route in `RootShell` (warm Header/Footer). A full-screen immersive
  page needs to either live at `/` with chrome hidden, or a route group with its own layout.
- `next.config.ts` images.remotePatterns: `images.unsplash.com`, `**.supabase.co/storage/...`.
- Env: `.env.example` — Supabase vars optional. `npm run build` passes locally & on Vercel with no env.
- Components to reuse for React integration: `src/components/product/ProductCard.tsx`,
  `src/components/home/*` (EditorialHero, FeaturedProductsSection, FloatingCollectionOcean, CategoryShowcase),
  `src/components/layout/{Header,Footer}.tsx`, cinematic components in `src/components/cinematic/`.

## 5) Environment constraints (important)
- apechain.com + urlbox + brandfetch + Wayback are blocked from the sandbox. Fonts CDN (Google) is blocked
  from the sandbox too — so headless screenshots show fallback fonts, but real browsers load them fine.
- No Vercel CLI / token in sandbox; `deploy_to_vercel` MCP only returns instructions. Deploys happen via the
  user's Vercel↔GitHub integration → opening/updating a PR auto-creates the Preview URL (that's how #79 deployed).
- To verify the static page headlessly: `npm i playwright-core@1.49.0` in a scratch dir, launch with
  `executablePath:'/opt/pw-browsers/chromium'`, load `file://…/public/apechain-clone/index.html`.
- Commits must use `git config user.email noreply@anthropic.com && user.name Claude` (stop-hook enforces it;
  use `git commit --amend --no-edit --reset-author` if flagged Unverified).

## 6) Decisions already made with the user
- Brand the demo as **ALMA LIFESTYLE** (not "apechain"); keep apechain's dark immersive structure/animation.
- Keep **fabric/colour cards** for the Panjabi line for now (no clothing photos yet).
- Preview delivery = **open a PR** so Vercel posts the preview link (done: PR #79).

## 7) Next step the user is deciding on
Do the **real React integration**: rebuild this immersive page as Alma's actual Next.js homepage
(React + Framer Motion, optionally the full R3F/Three.js WebGL hero from the brief) wired to
`loadCatalogProductsServer()` so it updates as products are added in admin. When the user provides a few
Panjabi photos (or Supabase URL+anon key), switch the hero/grid from fabric cards to real photographic cards.
Respect: no-demo-assets guard, Bengali-first copy, warm brand tokens option vs. apechain-dark, and the
`RootShell` chrome question (hide global Header/Footer for the immersive homepage).

## 8) Handy commands
- Rebuild demo: `node scripts/build-apechain-demo.mjs`
- Full build check: `npm run build`
- Dev: `npm run dev`
