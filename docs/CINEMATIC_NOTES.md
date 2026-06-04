# Cinematic homepage notes

## Architecture (sync)

- **Mode toggle:** `site_config.cinematic_mode_enabled` is merged into `HomepageConfig.cinematicMode` on every server load (`getHomepageConfigOrDefault`).
- **Copy/media:** `site_config.cinematic_content` (admin **Homepage → Cinematic** tab).
- **Layout:** `HomePageRenderer` renders cinematic stack when `cinematicMode` is true and URL is not editorial-only preview.
- **Admin preview:** iframe uses `cinematic=1` when mode is on; draft edits use `src/lib/cinematic-preview-draft.ts`.

See [ADMIN_SYNC.md](./ADMIN_SYNC.md) for the full admin ↔ live checklist.

---

## Overview

The Alma Lifestyle cinematic homepage is toggled via **Admin → Settings → Homepage → Cinematic Homepage** (`site_config.cinematic_mode_enabled`). When enabled, the storefront renders cinematic variants from `src/components/cinematic/` without modifying editorial components in `src/components/home/`.

## Phase 3 — WOW-Breakers + Next-Level 3D (feat/cinematic-phase-3)

### Part A — Emoji elimination

| Section | Cinematic component | Notes |
|---------|---------------------|-------|
| Why Choose ALMA | `CinematicWhyAlma.tsx` | 6 custom SVG line-art icons with `pathLength` draw animation |
| Our Process | `CinematicProcessTimeline.tsx` | Scroll-bound vertical timeline, 6 SVG step illustrations |

### Part B — Section elevation

| Section | Cinematic component | Notes |
|---------|---------------------|-------|
| FAQ | `CinematicFAQ.tsx` | Editorial large typography, AnimatePresence expand |
| Trust strip | `CinematicTrustPillars.tsx` | Truck / cash / return SVG icons, mustard underlines |
| Featured products | `CinematicFeaturedScroll.tsx` | Horizontal scroll-snap, no pagination dots |
| Family matching | `CinematicFamilyShowcase.tsx` | Full-bleed banner, color swatch cross-fade |
| Community | `CinematicCommunityMosaic.tsx` | Real-photo mosaic; empty state shows “Coming soon”; `hideUntilPhotosAdded` admin toggle |

### Part C — 3D / WOW amplifiers

| Feature | Location | Desktop only |
|---------|----------|--------------|
| 3D card tilt | `use3DTilt.ts` + `TiltSurface.tsx` | Yes (`pointer: fine`) |
| Page transitions | `src/app/template.tsx` + `CinematicLink.tsx` | Blur-fade; reduced motion skips |
| Particle atmosphere | `ParticleAtmosphere.tsx` in `CinematicGlobalChrome` | Yes; disabled on mobile / slow connection |
| Glassmorphism category overlays | `CinematicCategoryReel.tsx` | Hover on desktop |
| Hero CTA pulse | `CinematicHero.tsx` | After 9s reveal sequence |
| Magnetic CTAs | `useMagneticHover.ts` | Hero, closing section CTAs |
| Image clip-path reveal | `CinematicImageRevealInit.tsx` + `.cinematic-image-reveal` | Respects reduced motion |

### Wiring

- `HomePageRenderer.tsx` — `buildInsertAfter(extras, cinematicActive)` swaps FAQ, Why ALMA, Process, Family Matching
- `renderCinematicSectionContent()` — featured, community, trust, etc.

### Mobile / a11y

- All cinematic components use `useReducedMotion()` where animations apply
- 3D tilt, magnetic hover, and particles disabled on coarse pointers / mobile
- Process timeline: vertical stack, no sticky line on mobile

### QA commands

```bash
npm run build
npm run type-check
```

### Killswitch

Disable **Cinematic Homepage** in admin settings to revert to the full editorial homepage instantly.

## Admin-editable cinematic content (fix/eliminate-demo-data-admin-audit)

Cinematic-only copy and media live in `site_config` key **`cinematic_content`** (JSONB). Admins edit via **Admin → Homepage → Cinematic tab**.

| Block | Fields |
|-------|--------|
| Hero | eyebrow, subheading, meta left/right, video URL + MP4 upload, poster image |
| Pinned chapters | section number + 4 stages (eyebrow, heading, body, gradient colors, optional CTA) |
| Closing CTA | eyebrow, heading, CTA label + href |
| Why ALMA | section title/subtitle + 6 pillars (title, description) |
| FAQ | section title + Q&A repeater |

### Data flow

- Migration `016_cinematic_homepage_content.sql` seeds defaults from `cinematic-config.ts`
- Server: `loadCinematicContentServer()` → `HomePageRenderer` → each cinematic component accepts `content` prop
- API: `GET/PUT /api/v1/cinematic-content` (public read, admin write)
- Fallback: `mergeCinematicContent()` merges partial DB rows with `getDefaultCinematicContent()`

### Demo asset elimination

- `CinematicFeaturedScroll` uses real `product.galleryImages` (same pattern as `ProductCard`)
- All Unsplash fallbacks replaced with Alma SVG gradient placeholders in `src/lib/default-images.ts`
- CI guard: `npm run check-assets` (runs on `predev` and `prebuild`) blocks new demo URLs in `src/`

### QA commands

```bash
npm run check-assets
npm run type-check
npm run build
```

