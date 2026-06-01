# Production features guide

Four production-blocking capabilities: dynamic navigation, live cart pricing, order notifications, and customer accounts.

## Phase 1 — Dynamic navigation menu

### How it works

- Categories with **Show in navigation menu** and **Active** appear in the header (up to 4, sorted by display order).
- Static links always included: দোকান, নতুন এসেছে, আমাদের সম্পর্কে.
- Saving a category revalidates the root layout (`revalidatePath('/', 'layout')`).

### Admin

1. Go to **Admin → Products → Categories**.
2. Edit a category: toggle **Show in navigation menu**, set **Menu display order**.
3. Save — header updates within ~60s on the customer site.

### Database

Run migration: `supabase/migrations/007_category_menu.sql`

---

## Phase 2 — Live cart prices

### How it works

- Cart stores `priceSnapshot` at add-to-cart time; display uses live prices from `POST /api/v1/products/prices`.
- Prices refresh every 30s while the cart is open.
- Checkout re-fetches prices before submit; server uses DB prices when creating the order (client cannot underpay).
- Out-of-stock products show a warning and block checkout.

### Testing

1. Add product to cart at price X.
2. Admin changes price to Y.
3. Open cart — shows Y with “দাম পরিবর্তিত হয়েছে”.
4. Complete checkout — order uses Y.

---

## Phase 3 — Order notifications

### External setup required

#### CallMeBot (WhatsApp to admin)

1. Follow: https://www.callmebot.com/blog/free-api-whatsapp-messages/
2. Add the bot to your WhatsApp and get an API key.
3. Set env vars:
   - `CALLMEBOT_API_KEY`
   - `ADMIN_WHATSAPP_NUMBER` (e.g. `8801307777733`, country code, no `+`)

#### Resend (email)

1. Sign up: https://resend.com
2. Verify domain or use `onboarding@resend.dev` for testing.
3. Set env vars:
   - `RESEND_API_KEY=re_...`
   - `FROM_EMAIL=orders@yourdomain.com` (or `onboarding@resend.dev`)
   - `ADMIN_EMAIL=admin@yourdomain.com` (backup admin alerts)

Optional: `NEXT_PUBLIC_SITE_URL=https://almatraders.com` for links in WhatsApp messages.

### Test page

**Admin →** open `/admin/notifications/test` — run WhatsApp and email tests.

### Behaviour

| Event | Admin | Customer |
|-------|-------|----------|
| New order | WhatsApp + email (if `ADMIN_EMAIL` set) | Email if checkout email provided |
| Status change | — | Email if customer email on file |

Notifications are fire-and-forget (do not block the API response).

---

## Phase 4 — Customer accounts & tracking

### External setup required

1. **Supabase Dashboard → Authentication → Providers → Email** — enable email auth.
2. Configure site URL and redirect URLs for `/login`, `/signup`, `/forgot-password`.
3. Run migration: `supabase/migrations/008_customer_accounts.sql`

### Customer routes

| Route | Purpose |
|-------|---------|
| `/signup` | Create account + customer profile |
| `/login` | Sign in |
| `/forgot-password` | Password reset email |
| `/account` | Order history (logged in) |
| `/track` | Guest tracking by order # + phone |

### Guest checkout

Guest checkout still works. Logged-in users get `customer_id` on orders automatically.

### Env vars (existing Supabase)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Full env checklist

```bash
# Phase 3
RESEND_API_KEY=
FROM_EMAIL=
ADMIN_EMAIL=
CALLMEBOT_API_KEY=
ADMIN_WHATSAPP_NUMBER=

# Phase 4 (Supabase — usually already set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEXT_PUBLIC_SITE_URL=
```

---

## Verification checklist

### Phase 1

- [ ] Toggle category off menu → hidden in header
- [ ] Reorder categories → header order updates
- [ ] Mobile drawer shows same dynamic links

### Phase 2

- [ ] Price change shows warning in cart
- [ ] Out-of-stock blocks checkout
- [ ] Order total matches server prices

### Phase 3

- [ ] `/admin/notifications/test` WhatsApp + email succeed
- [ ] Test order triggers admin WhatsApp
- [ ] Customer with email gets confirmation
- [ ] Status update sends customer email

### Phase 4

- [ ] Sign up → `/account` shows profile
- [ ] Logged-in order appears in account
- [ ] Guest track works with order # + phone
