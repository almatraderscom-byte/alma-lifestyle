# Alma Lifestyle — Project Context

## Product vision

Premium Bangladeshi fashion ecommerce: elegant branding with **familiar, product-first** browsing UX inspired by supplier-style catalog usability (dense grids, obvious categories, scannable cards)—not cinematic editorial sites.

## UX principles (current rebuild)

1. Products visible immediately on homepage
2. Obvious category and collection navigation
3. Dense, comparable product grids
4. Clear pricing (BDT), sizes, and add-to-cart
5. Premium aesthetic without excessive whitespace or hidden nav

## Tech stack

- Next.js 16 App Router, TypeScript, Tailwind CSS 4
- Customer routes: `src/app/(shop)/`
- Components: `src/components/shop/`, `src/components/shared/`
- Catalog data: `src/lib/shop/mock-data.ts` (until API/DB wired)

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Product-first homepage |
| `/products` | Full catalog with filters/sort |
| `/products/[slug]` | Commerce-focused PDP |
| `/collections` | Collection index |
| `/collections/[slug]` | Collection product grid |

## Brand tokens

- Cream background `#f7f4ef`, ink `#1a1814`, accent gold `#b8956a`
- Display: Playfair Display; UI: Geist Sans
