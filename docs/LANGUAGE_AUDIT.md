# Language audit — ALMA customer storefront

Audit date: 2026-06-01  
Style target: **Bangladeshi mixed** — cultural Bangla for brand/story; standard English for ecommerce UI.

## Category key

| Code | Rule |
|------|------|
| **A** | Keep English (universal ecommerce) |
| **B** | Mixed / hybrid acceptable |
| **C** | Keep Bangla (cultural, descriptive, product copy) |
| **D** | Bengali numerals for prices/qty; English digits for phone, order IDs, email, URLs |

---

## Header & navigation

| Location | Before | After | Cat |
|----------|--------|-------|-----|
| `MOBILE_NAV_ICONS.search` | খুঁজুন | Search | A |
| `MOBILE_NAV_ICONS.wishlist` | পছন্দ | Wishlist | A |
| `MOBILE_NAV_ICONS.bag` | ব্যাগ | Cart | A |
| `NAV.shop` | দোকান | দোকান | C |
| `NAV.newArrivals` | নতুন এসেছে | নতুন এসেছে | C |
| `NAV.collections` | কালেকশন | কালেকশন | C |
| `NAV.about` | আমাদের সম্পর্কে | আমাদের সম্পর্কে | C |
| `HeaderAuthLinks` | লগইন / অ্যাকাউন্ট / ট্র্যাক | Login / My Account / Track Order | A |

---

## Homepage (editorial)

| Location | Treatment | Cat |
|----------|-----------|-----|
| `EDITORIAL_HERO.title` | ঐতিহ্যের নতুন রূপ | C |
| `EDITORIAL_HERO.ctaPrimary` | View Collection | A |
| `EDITORIAL_HERO.ctaSecondary` | গল্পটা জানুন → | C |
| `BRAND_STORY`, `REVIEWS_SECTION` body | Full Bangla | C |
| `TRUST_STRIP` titles | Bangla descriptive | C/B |

---

## Product listing (PLP)

| Location | Before | After | Cat |
|----------|--------|-------|-----|
| `PRODUCTS_PAGE.filter` | ফিল্টার | Filter | A |
| `PRODUCTS_PAGE.sortLabel` | সাজান | Sort | A |
| `PRODUCTS_PAGE.colorTitle` | রঙ | Color | A |
| `PRODUCTS_PAGE.sizeTitle` | সাইজ | Size | A |
| `PRODUCTS_PAGE.titleAll` | সব পণ্য | সব পণ্য | C |
| Product titles in data | Bangla | Bangla | C |
| Prices | `formatBdtPrice` | Bengali numerals | D |

---

## Product cards & PDP

| Location | Before | After | Cat |
|----------|--------|-------|-----|
| `FEATURED_SECTION.addToBag` | ব্যাগে যোগ করুন | Add to Cart | A |
| `FEATURED_SECTION.newBadge` | নতুন | NEW | A |
| `PDP.addToBag` / `buyNow` | Bangla | Add to Cart / Buy Now | A |
| `PDP.selectSize` / `quantity` | Bangla | Size / Quantity | A |
| `PDP.accordion.description` | বিবরণ | বিস্তারিত | C |
| Wishlist `aria-label` | Bangla | Add to Wishlist / Remove from Wishlist | A |
| Product descriptions | Bangla | Bangla | C |

---

## Cart & checkout

| Location | Before | After | Cat |
|----------|--------|-------|-----|
| `CART.title` | আপনার শপিং ব্যাগ | Your Cart | A |
| `CART.checkout` | চেকআউট করুন | Checkout | A |
| `CART.subtotal` / `total` | Bangla | Subtotal / Total | A |
| `CART.emptyTitle` | …খালি | Your cart is empty | A |
| `CHECKOUT` form labels | Bangla | Name, Phone, Email, Address, City | A |
| `CHECKOUT.submit` | অর্ডার নিশ্চিত করুন | Place Order | A |
| `CHECKOUT.paymentBkash` | বিকাশ | bKash | A |
| Placeholders | Bangla hints | Bangla hints (unchanged) | B |

---

## Order confirmation & tracking

| Location | Before | After | Cat |
|----------|--------|-------|-----|
| `CONFIRMATION.title` | অর্ডার সফল… | Same (celebratory Bangla) | C |
| `CONFIRMATION.orderNumberPrefix` | অর্ডার নম্বর | Order Number: | A |
| `CONFIRMATION.whatsappTrack` | Bangla | Track Order on WhatsApp | A |
| `TRACK.*` | Bangla | English UI labels | A |
| Order status labels | Bangla | Pending, Shipped, etc. | A |
| Order numbers | ALM-… | English digits | D |

---

## Auth pages

| Page | Treatment |
|------|-----------|
| `/login`, `/signup`, `/forgot-password` | English labels & buttons via `AUTH` |
| `/account` | My Orders, Logout, Track Order (Guest) |

---

## Admin panel

**No changes** — remains 100% English (`/admin/*`).

---

## Files updated (implementation)

- `src/lib/ui-terms.ts` — canonical English UI constants
- `src/lib/content.ts` — storefront copy wired to `UI`
- `src/lib/order-status-labels.ts` — order status English labels
- Layout: `Header.tsx`, `HeaderAuthLinks.tsx`, `HeaderNavLinks.tsx`
- Commerce: `ProductCard.tsx`, `CartPageContent.tsx`, `CheckoutForm.tsx` (via content), `CheckoutPageContent.tsx`, `OrderSummary.tsx`, `ProductMatchingSetPDP.tsx`, `OrderTrackingDisplay.tsx`
- Pages: `login`, `signup`, `forgot-password`, `track`, `account`

---

## Remaining Bangla (intentional)

- Homepage section headings and body copy
- Product titles and descriptions
- Review quotes and FAQ answers
- Footer section titles (দ্রুত লিংক, সাহায্য)
- City names in checkout dropdown
- WhatsApp prefill message (conversational Bangla)

Report any awkward strings in GitHub issues with page URL and screenshot.
