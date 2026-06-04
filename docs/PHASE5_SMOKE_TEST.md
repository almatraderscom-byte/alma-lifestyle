# Phase 5 — Smoke test checklist

Run on production after deploy (desktop + mobile).

## Journey 1 — Browse + buy

1. Open `/` — homepage loads, cinematic or editorial hero visible
2. Scroll full page — no horizontal scroll, no blank sections
3. Open `/products?category=islamic` — tap all 10 products → PDP loads
4. Add to cart → `/cart` shows line items
5. `/checkout` — form renders; place test order if staging allows

## Journey 2 — Discovery

1. `/products?type=men_panjabi` — listing filtered (not full catalog)
2. `/products?type=family-set` — matching sets only
3. Search/filter/sort on `/products`
4. `/faq`, `/collections`, `/track`

## Journey 3 — Admin (manual auth)

1. `/admin/login` → login
2. `/admin/homepage` — edit hero → save → verify `/` within 60s
3. `/admin/products` — upload image → verify PDP
4. `/admin/settings` — toggle cinematic → verify homepage layout

## Regression

- Static demo slugs: `/products/royal-navy-panjabi` → PDP (not generic 404)
- `/wishlist` → redirects to `/products`
