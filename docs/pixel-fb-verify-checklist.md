# Facebook Events Manager — manual verification checklist

Use this checklist after automated production smoke tests (`npm run verify:pixel:prod`) pass. These steps require a logged-in Meta Business account and **cannot** be automated.

Print this page or copy the checklist into your launch runbook.

---

## Before you start

- [ ] Automated smoke test passed: `npm run verify:pixel:prod`
- [ ] Pixel ID in `.env.local` matches Vercel Production env: `NEXT_PUBLIC_FB_PIXEL_ID`
- [ ] Latest production deploy is live on `https://www.almatraders.com`

---

## Events Manager access

- [ ] Login to [business.facebook.com](https://business.facebook.com)
- [ ] Navigate to **Events Manager**
- [ ] Select pixel: **Alma Online Shop Pixel** (ID ending in your configured pixel ID)
- [ ] Open the **Overview** tab

---

## Overview tab — event status

For each event below, confirm status shows **Active** (or equivalent healthy state):

| Event | Expected status | Verified |
|-------|-----------------|----------|
| **Purchase** | ACTIVE | [ ] |
| **AddToCart** | ACTIVE | [ ] |
| **InitiateCheckout** | ACTIVE | [ ] |
| **ViewContent** | ACTIVE | [ ] |
| **Lead** | ACTIVE | [ ] |
| **Search** | ACTIVE *or* absent (no site search UI yet) | [ ] |
| **PageView** | ACTIVE | [ ] |

- [ ] Screenshot saved: Overview tab showing Active events (filename suggestion: `events-manager-overview-YYYY-MM-DD.png`)

---

## Test Events tab

- [ ] Open **Test Events** tab for the pixel
- [ ] Confirm recent traffic from your verification run appears (PageView, ViewContent, InitiateCheckout)
- [ ] Note timestamp of latest events: _______________

---

## Purchase event quality (manual test orders required)

Complete **5–10 real test orders** on production (Cash on Delivery is fine). Then verify in Events Manager:

- [ ] **Purchase** events appear on order confirmation
- [ ] Currency is **BDT**
- [ ] Order values match checkout totals (product + delivery)
- [ ] `order_id` / order number present where shown
- [ ] Refreshing confirmation page does **not** duplicate Purchase

---

## AddToCart & Lead (spot check)

- [ ] Add a product from `/products` → AddToCart appears in Overview / Test Events
- [ ] Click a WhatsApp CTA → **Lead** appears (not Purchase)

---

## Mobile checkout (manual)

- [ ] Open production site on a real phone (or mobile emulation with throttling)
- [ ] Add item → checkout → confirm **InitiateCheckout** in Events Manager or Pixel Helper
- [ ] Complete one test mobile order → **Purchase** fires once

Record result in optional gate file for `npm run pre-launch-check`:

```json
{
  "purchaseActive": true,
  "mobileCheckoutVerified": true,
  "testOrdersPlaced": 7
}
```

Save as `.pixel-prelaunch-manual.json` in the project root (gitignored).

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Marketing / Ads | | | |
| Engineering | | | |

**Go for ads:** all boxes checked + `npm run pre-launch-check` shows READY.

---

## Quick links

- Events Manager: `https://business.facebook.com/events_manager2/list/pixel/[PIXEL_ID]/overview`
- Test Events: `https://business.facebook.com/events_manager2/list/pixel/[PIXEL_ID]/test_events`
- Replace `[PIXEL_ID]` with `NEXT_PUBLIC_FB_PIXEL_ID` from `.env.local`
