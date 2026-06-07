# Meta Pixel workflow — pre-ad launch

Single-glance dashboard before editing Facebook ad campaigns or increasing spend.

## One-command workflow

```bash
npm run pixel:full-check
```

This runs, in order:

1. **Local Playwright** — all 12 dev E2E pixel tests (`npm run test:pixel`)
2. **Production smoke** — read-only checks on `almatraders.com` (`npm run verify:pixel:prod`)
3. **Status report** — writes `docs/pixel-status-LATEST.md` and archives a timestamped copy

### Individual commands

| Command | Purpose |
|---------|---------|
| `npm run test:pixel` | Local dev suite only |
| `npm run verify:pixel:prod` | Production smoke only |
| `npm run pixel:report` | Regenerate dashboard from latest result files |
| `npm run pre-launch-check` | Production smoke + manual gate summary |

### Report output formats

```bash
npm run pixel:report                              # markdown (default)
npm run pixel:report -- --format=slack            # compact Slack message
npm run pixel:report -- --format=email            # HTML for email clients
```

Archived reports: `docs/pixel-reports/YYYY-MM-DD-HHmm.md` (last 10 kept).

---

## When to run

| Trigger | Command |
|---------|---------|
| After every production deploy | `npm run verify:pixel:prod` |
| Before editing FB ad campaign / conversion event | `npm run pixel:full-check` |
| Before increasing daily ad budget | `npm run pixel:full-check` |
| After pixel code or env var changes | `npm run pixel:full-check` |

---

## How to interpret the report

### Environment section

- **Development pixel** — masked ID from `.env.local` or `/api/pixel-test`
- **Production pixel** — masked ID from last production smoke run
- **Match** — dev and prod IDs must match Vercel `NEXT_PUBLIC_FB_PIXEL_ID`

### Local Test Results

All **12 steps** should show ✅. These validate event wiring, params (BDT, contents), dedupe, and dev tooling.

### Production Smoke Test Results

Required rows must be ✅:

- Homepage, Product list, PDP, Murda landing, Checkout (InitiateCheckout with mock cart)

⚠️ **Murda legacy URL** (`/murda-moshari` 404) is informational — use `/products/smart-murda-moshari`.

### Go/No-Go

| Status | Meaning |
|--------|---------|
| **GO ✅** | Automated + manual checklist complete |
| **REVIEW ⚠️** | Automated passed; manual steps remain |
| **NO-GO ❌** | Fix blockers before spending on ads |

### Exit codes (`pixel:full-check`)

| Code | Meaning |
|------|---------|
| `0` | All green — safe to launch / edit campaign |
| `1` | Critical failure — do not launch |
| `2` | Warnings — complete manual checklist first |

---

## Manual verification (cannot be automated)

Complete **docs/pixel-fb-verify-checklist.md**:

1. Login to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Confirm **Purchase**, **AddToCart**, **InitiateCheckout**, **ViewContent**, **Lead** are **Active**
3. Place **5–10 test orders** on production; verify Purchase shows **BDT** and correct values
4. Test **mobile checkout** on a real device

Record progress in `.pixel-prelaunch-manual.json` (gitignored):

```json
{
  "purchaseActive": true,
  "mobileCheckoutVerified": true,
  "testOrdersPlaced": 7
}
```

---

## Purchase as FB conversion event

You can set **Purchase** as the ad campaign conversion event when:

- Local test **#7 Purchase** passes
- Production **InitiateCheckout** and **ViewContent** smoke tests pass
- Events Manager shows **Purchase** as **Active** after real test orders
- Manual checklist file confirms test orders placed

Do **not** switch to Purchase optimization if production smoke fails or Purchase is not Active in Events Manager.

---

## If tests fail

| Failure | Action |
|---------|--------|
| Local Playwright timeout | Run `npm run dev`, confirm `NEXT_PUBLIC_FB_PIXEL_ID` in `.env.local` |
| Production PageView missing | Check Vercel env var scope (Production + Preview), redeploy |
| ViewContent missing on PDP | Confirm latest deploy includes `ProductViewTracker` |
| InitiateCheckout missing | Verify cart hydrates; check ad blockers in headless logs |
| Pixel ID mismatch | Sync `.env.local` with Vercel Production env |

**Contact:** Engineering owner for pixel/deploy issues · Marketing owner for Events Manager / ad account access.

---

## Related docs

- [pixel-testing.md](./pixel-testing.md) — full dev test plan
- [pixel-fb-verify-checklist.md](./pixel-fb-verify-checklist.md) — printable Events Manager checklist
- [pixel-status-LATEST.md](./pixel-status-LATEST.md) — latest generated dashboard
