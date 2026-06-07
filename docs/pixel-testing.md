# Meta Pixel testing guide

Use this checklist before launching Facebook ads. All debug tooling below runs **only in development** (`npm run dev`) and is excluded from production builds.

## Quick start

1. Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_FB_PIXEL_ID`.
2. Run `npm run dev`.
3. Open `http://localhost:3000/api/pixel-test` — confirm `pixelIdConfigured: true`.
4. Open the site, press **Ctrl+Shift+P** to toggle the debug overlay.
5. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkhcbn) and walk through the scenarios below.

Replace `[PIXEL_ID]` with your actual pixel ID from `.env.local` or the masked value from `/api/pixel-test`.

**Events Manager test events URL:**

`https://business.facebook.com/events_manager2/list/pixel/[PIXEL_ID]/test_events`

---

## Development tooling

| Tool | Purpose |
|------|---------|
| **Debug overlay** | Bottom-right panel (above WhatsApp). Shows event name, params, timestamp. **Ctrl+Shift+P** toggles. **Clear** resets the list. |
| **Console logs** | Color-coded `[Meta Pixel]` entries from `src/lib/pixel.ts` |
| **`GET /api/pixel-test`** | Server diagnostic: env var set, masked pixel ID, Events Manager URLs |

### Console color key

| Event | Color |
|-------|-------|
| Purchase | Green |
| AddToCart | Blue |
| ViewContent | Gray |
| Lead | Orange |
| InitiateCheckout | Purple |
| Search | Yellow |
| PageView | Dark gray |

---

## Implemented events

### PageView (automatic)

| | |
|---|---|
| **Trigger** | Every page load via `FacebookPixel` in `src/app/layout.tsx` |
| **Params** | Standard Meta PageView |

**How to test**

1. Open homepage.
2. Overlay / console: `PageView`.
3. Pixel Helper: green checkmark on PageView.

**Expected console**

```
[Meta Pixel] PageView  { params: {}, timestamp: "...", source: "fbq" }
```

---

### ViewContent

| | |
|---|---|
| **Trigger** | Product detail page mount (`ProductViewTracker` via `ProductPageSeo`); Murda landing mount (`MurdaMoshariLanding`) |
| **Params** | `content_ids`, `content_name` (Bengali), `value`, `currency: BDT`, `content_type: product` |

**How to test**

1. Visit any PDP, e.g. `/products/smart-murda-moshari`.
2. Expect **one** ViewContent per navigation (not on every re-render).

**Expected console**

```
[Meta Pixel] ViewContent  { params: { content_ids: ["..."], content_name: "...", value: 1790, currency: "BDT", ... }, source: "pixel.ts" }
```

---

### AddToCart

| | |
|---|---|
| **Trigger** | “Add to bag” / “Buy now” on product cards, PDP, matching-set PDP, cinematic featured scroll, Murda sticky order / pricing CTA |
| **Params** | `value`, `currency: BDT`, `contents: [{ id, quantity, item_price }]`, `content_type: product` |

**How to test**

1. On `/products`, click **ব্যাগে যোগ করুন** on a card → AddToCart.
2. On PDP, click **এখনই কিনুন** → AddToCart (then redirects to cart).
3. On Murda landing, click sticky **অর্ডার করতে চাই** → AddToCart + redirect to checkout.

**Expected console**

```
[Meta Pixel] AddToCart  { params: { value: 1790, currency: "BDT", contents: [...] }, source: "pixel.ts" }
```

---

### InitiateCheckout

| | |
|---|---|
| **Trigger** | Checkout page load (`CheckoutPageContent`) — fires once per visit (ref guard) |
| **Params** | `value` (cart subtotal), `currency: BDT`, `num_items`, optional `contents` |

**How to test**

1. Add item to cart → go to `/checkout`.
2. Expect InitiateCheckout once.
3. Refresh page — should **not** fire again in the same session.

**Expected console**

```
[Meta Pixel] InitiateCheckout  { params: { value: ..., num_items: ..., currency: "BDT" }, source: "pixel.ts" }
```

---

### Purchase

| | |
|---|---|
| **Trigger** | Order confirmation `/checkout/confirmation` after successful web checkout |
| **Params** | `value` (order total BDT), `currency`, `contents`, `num_items`, `order_id` |
| **Dedupe** | `trackPurchaseOnce()` — sessionStorage key `alma-pixel-purchase-{orderNumber}` |

**How to test**

1. Complete a test order through web checkout.
2. On confirmation page: one Purchase event.
3. Refresh confirmation — **no second Purchase**.
4. Clear sessionStorage → refresh — fires again (edge case only).

**Expected console**

```
[Meta Pixel] Purchase  { params: { value: ..., num_items: ..., contents: [...], order_id: "ALM-..." }, source: "pixel.ts" }
```

**Note:** WhatsApp-only orders from cart do **not** hit confirmation — they fire **Lead**, not Purchase.

---

### Lead

| | |
|---|---|
| **Trigger** | Any WhatsApp link/button: floating button, footer, cart WhatsApp order, PDP WhatsApp, Murda sections, `WhatsAppLink`, confirmation track link |
| **Params** | None |

**How to test**

1. Click floating green WhatsApp button → Lead.
2. Cart → **WhatsApp অর্ডার** → Lead.
3. PDP → WhatsApp CTA → Lead.

**Expected console**

```
[Meta Pixel] Lead  { params: {}, source: "pixel.ts" }
```

---

### Search

| | |
|---|---|
| **Status** | **Not implemented** — site has no search submit UI (header icon links to `/products` only) |
| **Future** | Call `trackSearch(query)` when a search form is added |

---

## Meta Pixel Helper (Chrome)

**Install:** [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkhcbn)

### What to look for

- Extension icon shows pixel count (e.g. `1`).
- Click icon → **green checkmark** next to each event name.
- Expand event → verify parameters (value, currency, contents).
- PageView should appear on every page.

### Common issues and fixes

| Issue | Fix |
|-------|-----|
| Helper shows “No pixel found” | Set `NEXT_PUBLIC_FB_PIXEL_ID` in `.env.local`, restart dev server. On production, redeploy after adding env var in Vercel. |
| Events in console/overlay but not in Helper | Disable ad blockers / privacy extensions for your domain. |
| `fbq not loaded` warning in console | Pixel script blocked or slow network. Check Network tab for `fbevents.js` (200). |
| Duplicate Purchase | Should not happen — check sessionStorage dedupe. Report if refresh fires Purchase twice. |
| ViewContent fires twice | Navigate away and back — once per product view is expected. Strict Mode double-mount in dev may cause duplicate in some edge cases. |
| `/api/pixel-test` returns 404 | Endpoint is **development only** — use Vercel preview or Events Manager on production. |
| Production events missing | Confirm env var scope is **Production and Preview**, then trigger a fresh deployment. |

---

## API diagnostic

```bash
curl http://localhost:3000/api/pixel-test | jq
```

Example response fields:

- `diagnostics.pixelIdConfigured` — must be `true`
- `diagnostics.pixelIdPreview` — masked ID (e.g. `4261…4128`)
- `eventsManager.testEventsUrl` — direct link to Meta test events tab

---

## Sequential test plan (run in order)

| Step | Action | Expected event(s) |
|------|--------|-------------------|
| 1 | Visit homepage `/` | **PageView** |
| 2 | Open `/api/pixel-test` | JSON shows `pixelIdConfigured: true` |
| 3 | Visit a product PDP | **PageView**, **ViewContent** |
| 4 | Click **ব্যাগে যোগ করুন** on a product card | **AddToCart** |
| 5 | Open PDP → **এখনই কিনুন** | **AddToCart** |
| 6 | Go to `/checkout` | **InitiateCheckout** (once) |
| 7 | Complete test order → confirmation | **Purchase** (once) |
| 8 | Refresh confirmation page | No new **Purchase** |
| 9 | Click WhatsApp on confirmation | **Lead** |
| 10 | Cart → WhatsApp order (skip web checkout) | **Lead** only (no Purchase) |
| 11 | Murda landing → sticky order button | **AddToCart** + **InitiateCheckout** on checkout |
| 12 | Click any WhatsApp CTA site-wide | **Lead** |

After each step, confirm in:

1. Debug overlay (Ctrl+Shift+P)
2. DevTools console (color-coded logs)
3. Meta Pixel Helper (green checkmark)
4. [Events Manager → Test events](https://business.facebook.com/events_manager2/list/pixel/[PIXEL_ID]/test_events) (production/preview with test browser code optional)

---

## Production safety

- `PixelDevTools`, `PixelDebugOverlay`, and `/api/pixel-test` are gated by `NODE_ENV === 'development'`.
- `pixel-dev.ts` is loaded via dynamic import only in development branches.
- Production builds still send real events to Meta via `src/lib/pixel.ts` — no debug UI or extra console noise.
