# Murda Moshari landing — engineering notes

## Bangla string splitting

Never `.split('')` on Bangla — splits Unicode code points and breaks conjuncts (যুক্তাক্ষর) and dependent vowels (কার). Use `.split(' ')` for word-level animation. Character-level splits are only safe for ASCII or Bangla digits (০–৯).

## Above-the-fold animations

Do not use `whileInView` on hero or first-screen content; IntersectionObserver may not fire on initial paint. Use `animate` on mount instead.

## Sticky narrative opacity

Scene opacity keyframes must not overlap between neighbors. Use sequential handoff: scene N reaches opacity 0 before scene N+1 fades in. Overlapping crossfades on absolutely stacked text causes chaotic overlap.

## Content source

Store copy in `product_landing_contents` (JSONB) and edit via `/admin/landing/[slug]`. `src/lib/content.ts` `MURDA_MOSHARI_PAGE` remains the static fallback when DB is empty or unavailable.
