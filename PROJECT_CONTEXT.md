# Alma Lifestyle — Project Context

## Product vision

**Premium modern fashion ecommerce** for Bangladesh: world-class visual presentation (cinematic, polished, emotional) combined with **supplier-inspired browsing usability** (product-first, dense grids, obvious categories, clear BDT pricing).

## Design balance (current)

| Keep | Avoid |
|------|--------|
| Product-first homepage & catalog flow | Ultra-editorial layouts that hide products |
| Dense scannable grids | Generic flat marketplace UI |
| Obvious nav, filters, CTAs | Apple-style abstraction |
| Framer Motion (luxury easing) | Motion that blocks shopping |

## Visual system

- **Surfaces**: cream `#f8f5f0`, champagne, obsidian/ink for contrast sections
- **Accent**: gold `#c4a574`, rose `#a67c6d`
- **Type**: Playfair Display (headlines), Cormorant (accent italic), Geist (UI)
- **Motion**: `src/lib/motion.ts` — luxury cubic-bezier, stagger reveals, card hover lift

## Tech stack

- Next.js 16 App Router, TypeScript, Tailwind CSS 4, Framer Motion
- Routes: `src/app/(shop)/`
- Components: `src/components/shop/`, `src/components/shared/`
- Data: `src/lib/shop/mock-data.ts` (until API)

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Premium hero + immediate product spotlight grid |
| `/products` | Catalog with sidebar filters |
| `/products/[slug]` | Commerce PDP with gallery + sticky buy panel |
| `/collections` | Editorial collection index |
| `/collections/[slug]` | Collection banner + product grid |
