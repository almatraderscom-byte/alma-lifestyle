# Language guidelines — ALMA storefront

## Purpose

Bangladeshi shoppers expect **English for ecommerce mechanics** (Cart, Checkout, Login) and **Bangla for brand and product storytelling**. This guide keeps that balance consistent.

## When to use English

Use English (`src/lib/ui-terms.ts` → `UI`) for:

- Buttons and CTAs: Add to Cart, Place Order, Checkout, Login
- Form field labels: Name, Email, Phone, Address, City
- Cart/checkout totals: Subtotal, Delivery, Total
- Filters and sort: Filter, Sort, Apply, Reset
- Order flow: Order Number, Track Order, status (Pending, Shipped, …)
- Stock badges: In Stock, Out of Stock, NEW, SALE
- Payment brands: bKash, Nagad, Cash on Delivery
- Social brands: WhatsApp, Facebook, Instagram

## When to use Bangla

Use Bangla for:

- Hero headlines and editorial sections (ঐতিহ্যের নতুন রূপ)
- Product titles and long descriptions
- Category names where cultural (পাঞ্জাবি, দোকান)
- Customer reviews and FAQ answers
- Celebratory messages (order success title)
- Trust/marketing copy in body paragraphs

## Mixed (hybrid) — OK

- Placeholders in Bangla with English labels: **Name** + `আপনার পুরো নাম`
- Nav: **দোকান** next to **Cart** / **Search**
- Footer: Bangla section titles, English payment chips

## Numerals

| Content | Format |
|---------|--------|
| Prices on site | Bengali numerals via `formatBdtPrice()` — ৳ ২,৫০০ |
| Cart quantity badge | Bengali via `toBanglaNumber()` |
| Phone numbers | English digits only — `01XXXXXXXXX` |
| Order IDs | English — `ALM-20260601-0001` |
| Email & URLs | English |

**Never** use Bengali numerals in phone numbers, order IDs, or email addresses.

## Adding new UI text

1. Check if the string is a **standard ecommerce term** → add to `ui-terms.ts` as `UI.myKey`.
2. Wire customer copy in `content.ts` using `UI` or a named export (`CART`, `CHECKOUT`, …).
3. In components, import from `@/lib/content` (preferred) or `@/lib/ui-terms` for one-off labels.
4. Do **not** hardcode Bangla for Cart/Checkout/Login-style controls.

Example:

```tsx
import { UI } from '@/lib/ui-terms';

<button type="button">{UI.addToCart}</button>
```

## Admin panel

All `/admin/*` UI stays **English only**. Do not route admin strings through Bangla content files.

## Quick reference

| Concept | Use |
|---------|-----|
| Shopping bag button | `UI.addToCart` |
| Cart page title | `UI.myCart` |
| Pay step | `UI.checkout` / `UI.placeOrder` |
| Sign in | `UI.login` |
| Product options | `UI.size`, `UI.color`, `UI.quantity` |

See full list in `src/lib/ui-terms.ts`.

## Review checklist (before merge)

- [ ] No new pure-Bangla labels for Cart, Checkout, Login, Filter, Sort
- [ ] Prices still use `formatBdtPrice`
- [ ] Phone placeholders use `01…` English digits
- [ ] Admin files untouched
- [ ] Brand headlines on homepage still Bangla where appropriate
