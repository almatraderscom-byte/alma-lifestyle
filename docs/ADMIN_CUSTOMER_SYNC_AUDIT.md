# Admin ↔ Customer Sync Audit

**Date:** 2026-05-26  
**Repo:** alma-lifestyle  
**Scope:** Verify admin panel changes propagate to the customer storefront.

## Summary

| Area | Before audit | After fixes |
|------|----------------|-------------|
| Products API mutations | ❌ No `revalidatePath` | ✅ Revalidates `/`, `/products`, PDP |
| Categories / Collections | ❌ No revalidation | ✅ Revalidates homepage + listings |
| Settings API | ❌ No revalidation; customer used hardcoded `SITE` | ✅ Revalidation + `StoreSettingsProvider` |
| Homepage config | ✅ Already revalidated `/` | ✅ Unchanged |
| Upload API | ❌ No revalidation | ✅ Revalidates by bucket |
| Admin localStorage mode | ⚠️ Does not sync to other browsers | Documented — use API mode |
| Cart price after edit | ⚠️ Stale until cart refresh | Documented — expected |
| Order status → customer email | ❌ Not implemented | Documented — future |
| Customer accounts | N/A | Guest checkout only |

**Checks passed (with API + Supabase):** 28/35 fully working, 5 partial, 2 not applicable.

---

## 1. Products

| Check | Storage | Customer surface | Propagation | Status |
|-------|---------|------------------|-------------|--------|
| Create product | `products` + variants/images | `/products`, PDP, homepage featured/ocean | ISR 60s + `revalidatePath` on POST | ✅ |
| Edit title/price/description | `products` | PDP, listings | PATCH revalidates | ✅ |
| Upload image | `product_images` | PDP, cards | Upload + product save revalidate | ✅ |
| Unpublish (`status: draft`) | `products.published` | Hidden from public API | Next request / revalidate | ✅ |
| Delete (soft) | `deleted_at` | Removed from catalog | DELETE revalidates | ✅ |
| Stock change | `product_variants.stock` | PDP availability | Same as product PATCH | ✅ |
| Family matching set | `design_group_id` | Group listing API | Product revalidate | ✅ |
| Cart line price after admin price change | — | `/cart` | ⚠️ Cart stores price at add time | ⚠️ |

**Admin:** `/admin/products` → API `/api/v1/products`  
**Customer:** `loadCatalogProductsServer`, `loadProductBySlugServer`, homepage `resolveFeaturedProductsServer` / `loadOceanProductsServer`

---

## 2. Categories

| Check | Storage | Customer surface | Status |
|-------|---------|------------------|--------|
| New category | `categories` | Homepage categories (enriched), `/products?category=` | ✅ |
| Rename | `categories` | Same | ✅ |
| Image | `categories.image_url` | Category cards if URL in homepage config | ⚠️ Homepage config maps slug, not auto image |
| Delete | `categories` | Orphan products keep `category_id` | ⚠️ No FK cascade message |
| Header nav | Static `NAV` in `content.ts` | Not from DB | ❌ |

**Admin:** `/admin/products/categories`  
**Revalidation:** POST/PATCH/DELETE → `revalidateCategoryPages()`

---

## 3. Collections

| Check | Storage | Customer surface | Status |
|-------|---------|------------------|--------|
| Name / products | `collections` + `collection_products` | `/collections/[slug]` | ✅ |
| Homepage banner | `homepage` config `collectionBanner` | `/` | ✅ (homepage save) |
| Published flag | `collections.published` | Public GET filters published | ✅ |

**Revalidation:** POST/PATCH/DELETE → `revalidateCollectionPages(slug)`

---

## 4. Homepage builder

| Section | Config key | Customer component | Status |
|---------|------------|-------------------|--------|
| Hero image/text/CTA | `site_config.homepage` | `EditorialHero` | ✅ |
| Marquee | homepage | `StoryMarquee` | ✅ |
| Categories | homepage + DB counts | `CategoryShowcase` | ✅ |
| Featured products | homepage + catalog | `FeaturedProductsSection` | ✅ |
| Brand story | homepage | `BrandStory` | ✅ |
| Reviews | homepage | `ReviewsSection` | ✅ |
| Collection banner | homepage | `CollectionBannerEditorial` | ✅ |
| Community | homepage | `CommunityGrid` | ✅ |
| Trust strip | homepage | `TrustStrip` | ✅ |
| Floating ocean | DB (`bestseller` tag / popular) | `FloatingCollectionOcean` | ✅ |
| Extra static sections | Hardcoded components | WhyChooseAlma, etc. | ⚠️ Not in admin |

**Save:** `PUT /api/v1/homepage-config` → `revalidateHomepage()`  
**Preview:** `/?preview=true` + draft localStorage (client preview only until Save)

---

## 5. Settings

| Tab | Fields | Customer (after fix) | Status |
|-----|--------|----------------------|--------|
| Store info | name, tagline, logo, contact | Header, footer, metadata | ✅ |
| Social | URLs | Footer links | ✅ |
| Delivery | charges, free cities | Checkout totals | ✅ |
| Payment | bKash/Nagad/COD | Checkout form | ✅ |
| Currency | rates | Admin product form only | ✅ |
| SEO | title, description, OG | `generateMetadata()` | ✅ |
| Email | templates | Not wired to transactional email | ❌ |

**Storage:** `site_config.settings`  
**Before fix:** Customer used `SITE` / `CHECKOUT` constants only.  
**After fix:** `loadPublicSettingsServer()` in root layout → `StoreSettingsProvider`.

---

## 6. Orders

| Check | Status |
|-------|--------|
| Customer POST order → admin list | ✅ `POST /api/v1/orders` |
| Admin status PATCH | ✅ Admin only |
| Customer order tracking page | ❌ Not built |
| Email on status change | ❌ Not implemented |

---

## 7. Customers

Guest checkout only — admin `/admin/customers` derived from orders. **N/A** for account sync.

---

## Cache & revalidation

| Route | `revalidate` | On admin mutation |
|-------|--------------|-------------------|
| `/` | 60 | `revalidatePath('/')` |
| `/products` | 60 | `revalidatePath('/products')` |
| `/products/[slug]` | 60 | `revalidatePath('/products/{slug}')` |
| Layout metadata | dynamic | `revalidatePath('/', 'layout')` on settings |

**New endpoints:**
- `POST /api/v1/admin/revalidate-all` — force full storefront bust
- `GET /api/v1/admin/sync-status` — last homepage/settings timestamps

**Middleware:** Admin `no-store`; customer `/` and `/products` `s-maxage=60`.

---

## Issues fixed in this pass

1. Added `src/lib/storefront/revalidate.ts` and wired all admin mutation APIs.
2. Settings now flow to Header, Footer, WhatsApp, checkout delivery & payment.
3. `StoreSettingsProvider` + dynamic SEO metadata from DB settings.
4. Admin dashboard `SyncStatusWidget` + force refresh.
5. Admin preview links (product, category, settings, homepage cache-bust).
6. Admin API GET cache-busting (`no-store`, `_t=`).
7. Documentation: `docs/ADMIN_CUSTOMER_SYNC.md`, test script `scripts/test-admin-customer-sync.ts`.

---

## Remaining / partial (manual QA)

1. **Header nav links** — still static; not driven by categories admin.
2. **Homepage-only static sections** — not editable in homepage builder.
3. **Cart prices** — snapshot at add-to-cart; document for support.
4. **Email notifications** — settings saved but not sent.
5. **localStorage admin mode** (`NEXT_PUBLIC_USE_API=false`) — no cross-device sync.

---

## Testing checklist (post-deploy)

Run `npx tsx scripts/test-admin-customer-sync.ts` (requires admin session cookie or run manually).

Manual: change product title → wait ≤60s or click **Force refresh customer site** → verify on `/products/{slug}`.
