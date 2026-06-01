# Admin → Customer sync architecture

## Data flow

```
Admin UI (client)
  → admin-store.ts / admin-api.ts
  → /api/v1/* (authenticated mutations)
  → Supabase (products, categories, collections, site_config)
  → revalidatePath() on success
  → Next.js ISR regenerates storefront pages (≤60s, or immediate after revalidate)
```

Customer pages **never** read `localStorage` admin keys. They load via:

- **Server components:** `loadCatalogProductsServer`, `loadHomepageConfigServer`, `loadPublicSettingsServer`, etc.
- **Client cart:** `CartContext` (localStorage `alma-cart`) — prices frozen at add time.

## Caching strategy

| Layer | Policy |
|-------|--------|
| Homepage `/` | `export const revalidate = 60` |
| Products listing & PDP | `revalidate = 60` |
| Admin routes | `Cache-Control: no-store` (middleware) |
| API v1 GET (admin) | `cache: 'no-store'` + timestamp query |
| After admin save | `revalidatePath` in API route handlers |

Central helpers live in `src/lib/storefront/revalidate.ts`.

## Adding a new admin section that affects the storefront

1. Persist to Supabase (or extend `site_config` JSON).
2. Load on the customer side in `src/lib/storefront/server-data.ts` (or a dedicated server query).
3. In the admin mutation API route, call the appropriate `revalidate*` helper.
4. If the change affects layout-wide UI (header/footer), call `revalidateSettingsPages()` or `revalidatePath('/', 'layout')`.
5. Document the connection in `docs/ADMIN_CUSTOMER_SYNC_AUDIT.md`.

## Preview vs production

- **Homepage builder preview** (`?preview=true`): uses draft config from `localStorage` on the client; **not** visible to other users until **Save** (PUT homepage-config).
- **Customer preview links** in admin append `?_={timestamp}` to reduce CDN/browser staleness.

## Force refresh

Admin dashboard → **Force refresh customer site** → `POST /api/v1/admin/revalidate-all`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Admin saves but site unchanged >2 min | Revalidate not called or wrong slug | Check API logs; use force refresh |
| Settings unchanged on site | Old deployment without `StoreSettingsProvider` | Deploy latest; revalidate layout |
| Product visible in admin but not shop | `published: false` or soft-deleted | Publish product |
| Homepage hero unchanged | Saved draft only, not PUT config | Click Save in homepage builder |
| `NEXT_PUBLIC_USE_API=false` | localStorage admin only | Set `true` and use Supabase |

## Environment

- `SUPABASE_SERVICE_ROLE_KEY` — required for server writes and catalog reads.
- `NEXT_PUBLIC_USE_API` — must be `true` (or unset) in production for real sync.
