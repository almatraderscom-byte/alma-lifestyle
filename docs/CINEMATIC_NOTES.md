# Cinematic Homepage Notes

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
