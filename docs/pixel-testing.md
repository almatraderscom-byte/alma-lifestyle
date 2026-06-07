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

---

## Production smoke testing

After deploying to production, run **read-only** checks against the live site. These tests never submit checkout forms or place orders.

### Commands

```bash
npm run verify:pixel:prod     # Colored CLI report (recommended)
npm run test:pixel:prod       # Playwright spec (same checks, CI-friendly)
npm run pre-launch-check      # Smoke test + pre-ad launch gate summary
```

Optional override:

```bash
PIXEL_PROD_BASE_URL=https://www.almatraders.com npm run verify:pixel:prod
```

### What is verified (automated)

For each captured pixel event, the smoke test confirms:

1. Request URL is `https://www.facebook.com/tr/`
2. Pixel ID in the URL matches `NEXT_PUBLIC_FB_PIXEL_ID`
3. Event name matches expected (`PageView`, `ViewContent`, `InitiateCheckout`, etc.)
4. HTTP response status is **200**

| Check | URL | Events |
|-------|-----|--------|
| Homepage | `/` | Pixel script loaded, **PageView** |
| Product list | `/products` | **PageView** |
| Sample PDP | First product from sitemap | **PageView**, **ViewContent** |
| Murda landing | `/products/smart-murda-moshari` | **PageView**, **ViewContent** |
| Checkout (mock cart) | `/checkout` | **InitiateCheckout** (localStorage cart only) |

Legacy URL `/murda-moshari` is reported separately if it returns 404 — use the canonical Murda path above for ads.

### File structure

```
playwright.production.config.ts
scripts/
├── verify-pixel-production.ts
├── pre-ad-launch-check.ts
└── lib/pixel-production-verify.ts
tests/
├── pixel-production.spec.ts
└── helpers/
    ├── pixel-production-env.ts
    └── pixel-production-monitor.ts
docs/pixel-fb-verify-checklist.md
```

### Pre-launch checklist

Before spending on ads, run:

```bash
npm run pre-launch-check
```

This runs the full production smoke test and prints a go/no-go summary. Optional manual confirmations can be recorded in `.pixel-prelaunch-manual.json`:

```json
{
  "purchaseActive": true,
  "mobileCheckoutVerified": true,
  "testOrdersPlaced": 7
}
```

See **docs/pixel-fb-verify-checklist.md** for the printable Events Manager checklist.

### What CANNOT be automated (manual only)

| Item | Why manual |
|------|------------|
| Events Manager **Overview** Active status | Requires Meta Business login |
| **Purchase** event on real orders | Must not automate production checkout |
| **AddToCart** / **Lead** on every surface | Optional spot checks; smoke test covers core paths |
| **Search** event | No search UI on site yet |
| Mobile device checkout | Real device + Meta login verification |
| Ad account / campaign setup | Outside codebase |

---

## Automated testing with Playwright (local dev)

The repo includes a Playwright suite that runs all 12 sequential pixel checks automatically.

### File structure

```
playwright.config.ts
scripts/pretest-pixel.mjs
tests/
├── pixel-events.spec.ts
├── helpers/
│   ├── pixel-interceptor.ts
│   ├── pixel-assertions.ts
│   ├── pixel-fixture.ts
│   └── seed-test-data.ts
└── reporters/
    └── pixel-events-reporter.ts
```

### Prerequisites

1. `NEXT_PUBLIC_FB_PIXEL_ID` set in `.env.local`
2. Chromium installed: `npx playwright install chromium`
3. Dev dependencies installed: `npm install`

Playwright starts `npm run dev` automatically unless a server is already running on port 3000.

### Commands

```bash
npm run test:pixel          # pre-flight checks + full suite
npm run test:pixel:ui       # interactive Playwright UI
npm run test:pixel:debug    # step-through debugger
npm run test:pixel:report   # open HTML report
```

### What each test verifies

For every event, the suite checks:

1. **Network** — intercepts real `facebook.com/tr/` requests via `PixelInterceptor`
2. **Console** — `[Meta Pixel]` log lines from `src/lib/pixel.ts`
3. **Debug overlay** — event row visible in the dev-only panel
4. **Params** — required e-commerce fields (`value`, `currency: BDT`, etc.)

WhatsApp clicks abort `wa.me` navigation but still verify the **Lead** click handler.

### Reading the report

After `npm run test:pixel`:

| Output | Location |
|--------|----------|
| Standard Playwright HTML report | `playwright-report/index.html` |
| Pixel event summary (tables per test) | `playwright-report/pixel-events-summary.html` |
| Failure screenshots / video / trace | `test-results/` |

Open the pixel summary for a step-by-step table of captured `facebook.com/tr/` events, console excerpts, and pass/fail status.

### Adding a new test

1. Add a case to `tests/pixel-events.spec.ts` (keep serial order if dependencies matter).
2. Use the `pixel` fixture from `tests/helpers/pixel-fixture.ts`.
3. Call `assertPixelEvent()` with the expected event name.
4. Attach data via `attachPixelReport()` in `afterEach` (already wired globally).

### Troubleshooting test failures

| Failure | Likely cause | Fix |
|---------|--------------|-----|
| `pretest-pixel` exits immediately | Missing `.env.local` or pixel ID | Set `NEXT_PUBLIC_FB_PIXEL_ID`, restart dev server |
| Timeout waiting for pixel event | `fbq` not loaded / ad blocker in headless | Confirm `/api/pixel-test` passes; check Network for `fbevents.js` |
| Overlay assertion fails | Panel hidden with Ctrl+Shift+P | Reload page — overlay defaults to visible in dev |
| Checkout test fails | Form validation / API error | Ensure mocked order route is active; verify Bengali placeholders still match |
| Duplicate InitiateCheckout | Expected once per visit | Test reload assertion — report if count increases |

Test orders are tagged with `PLAYWRIGHT_TEST_ORDER` in checkout notes/name fields for easy identification in admin.
