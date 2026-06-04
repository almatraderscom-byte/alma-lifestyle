# Cinematic Homepage — Engineering Notes

## Architecture
- Branch where built: feat/cinematic-homepage (merged to main on 2026-06-03)
- Entry point: HomePageRenderer.tsx checks `config.cinematicMode`
- All cinematic components: src/components/cinematic/
- Config: src/lib/cinematic-config.ts

## Toggle
- Database key: site_config.cinematic_mode_enabled
- Admin UI: /admin/settings → Homepage tab → "Cinematic Homepage" toggle
- Revalidation: homepage revalidates every 60s

## Hero Video
- Source: AI-generated via Kling 2.0 from family pink panjabi image
- File: /public/videos/hero/hero-family-pink-loop.mp4 (~1.3 MB)
- Poster fallback: /public/videos/hero/hero-poster.jpg (~421 KB)
- Mobile/slow connection: poster only, no video

## Pinned Chapters
- Outer: 2400px height (4 stages × 600px scroll)
- Inner: position: sticky, h-screen
- Active stage driven by useScroll progress
- Each stage maps to a product via CINEMATIC_CHAPTER_PRODUCTS config
- Stages clickable → product page

## Known Pitfalls
- Bangla text: never split by character (breaks conjuncts) — only by word
- Above-fold: never use whileInView (IntersectionObserver miss on first paint) — use animate on mount
- Pinned scroll: needs sufficient outer height + position: sticky inner with h-screen
- Asset paths: use /videos/hero/* directly, NOT through next/image (Next/Image caches and can serve wrong file)
- Vignette intensity: keep below 0.3 opacity max, otherwise product invisible

## Performance Targets
- Lighthouse mobile: > 65
- Lighthouse desktop: > 80
- First Contentful Paint: < 1.5s on 4G
- Largest Contentful Paint: < 2.5s on 4G

## Elevated Section Variants (feat/cinematic-sections-elevation)

When `config.cinematicMode === true`, HomePageRenderer swaps editorial components for cinematic variants. Original components in `src/components/home/` are untouched.

| Editorial | Cinematic Variant | Props |
|-----------|-------------------|-------|
| StoryMarquee | CinematicStoryStrip | `data: MarqueeSectionData` |
| CategoryShowcase | CinematicCategoryReel | `data: CategoriesSectionData` |
| FloatingCollectionOcean | MagneticConstellation | `products: OceanProduct[]` |
| BrandStory | CinematicBrandNarrative | `data: BrandStorySectionData` |
| ReviewsSection | CinematicTestimonialPin | `data: ReviewsSectionData` |
| CollectionBannerEditorial | CinematicCollectionDivider | `data: CollectionBannerSectionData` |
| CommunityGrid | CinematicCommunityMosaic | `data: CommunitySectionData` |
| TrustStrip | CinematicTrustPillars | `data: TrustSectionData` |

### Cinematic flow order
1. CinematicHero + loading overlay
2. ColorWashBridge (charcoal → cream)
3. CinematicStoryStrip
4. CinematicCategoryReel
5. ColorWashBridge (cream → warm-white)
6. MagneticConstellation
7. FeaturedProductsSection (if enabled)
8. PinnedChaptersSection
9. ColorWashBridge (warm-white → cream)
10. CinematicBrandNarrative
11. EditorialQuotePause
12. CinematicCommunityMosaic
13. CinematicTestimonialPin
14. HeroFilmStrip
15. CinematicCollectionDivider
16. CinematicTrustPillars
17. ColorWashBridge (cream → charcoal)
18. CinematicClosingSection

### Mobile fallbacks
- Sticky scroll sections (BrandNarrative, TestimonialPin) → vertical stacks on <768px
- MagneticConstellation → 2-column product grid
- CategoryReel → 85vw horizontal snap cards
- All sections respect `useReducedMotion()` with static fallbacks
