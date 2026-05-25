# ALMA Lifestyle — Admin panel guide

The admin dashboard is English-only and lives at `/admin`. The customer storefront remains in Bangla.

## Sign in

1. Open `/admin/login`.
2. **Supabase Auth (production):** use the email/password created in Supabase Authentication with a row in `admin_users`.
3. **Legacy dev login:** `admin@alma.com` / `admin123` (fallback when Supabase Auth is not configured).

If you see a yellow **local storage mode** banner, Supabase env vars are missing — data is stored in the browser only.

## Dashboard

- Revenue, orders, and product counts (from database when API mode is active).
- Quick links to products, orders, and homepage builder.

## Products

### List

- Search, filter by status, sort, bulk actions.
- Data source: Supabase via `/api/v1/products` when configured.

### Add / edit product

1. **Products** → **Add New** or edit from the table.
2. Fill title (English), optional Bangla title, pricing (BDT), category, description.
3. **Variants:** enable sizes/colors and stock per variant, or single stock.
4. **Images:** upload JPEG/PNG/WebP (max 5MB) → stored in Supabase `product-images` bucket.
5. **Collections:** assign to one or more collections.
6. **SEO:** optional meta title/description.
7. Save — creates/updates via API (`POST` / `PATCH`).

### Categories & collections

- **Categories** — taxonomy (Panjabi, Accessories, etc.).
- **Collections** — curated groups (Eid, New Arrivals); link products from the product form. To bring back a “best-sellers” shortcut in the footer, create a collection with slug `best-sellers` in the admin panel and add it back to `src/lib/content.ts` under `FOOTER.quickLinks`.

## Orders

- View order list with status filters.
- Order numbers use format `ALM-YYYYMMDD-####` when created through checkout API.
- Update status (pending → processing → shipped → delivered).

## Homepage builder

1. **Homepage Builder** in the sidebar.
2. Toggle sections on/off, reorder, edit Bangla copy and images.
3. **Save** — persists to `site_config` key `homepage` in Supabase (or localStorage in dev mode).
4. **Preview:** open the storefront with `?preview=true` to see draft changes (`alma-homepage-draft`).

Sections: Hero, Marquee, Categories, Featured products, Brand story, Reviews, Collection banner, Community grid, Trust strip.

## Settings

Tabs: General, Store, Shipping, Payments, Notifications, SEO, Advanced.

- **Save** writes to `site_config` key `settings`.
- Public fields (store name, contact) are exposed on the storefront via server load.

## Customers

Placeholder page for future CRM — orders hold customer contact data today.

## Backup & import

Use **Settings → Advanced** (if enabled) or browser export from local storage mode. In production, rely on Supabase backups.

## FAQs

**Why don’t my homepage changes show on the live site?**  
Save in the builder, wait up to 60 seconds for ISR, or hard-refresh. Draft preview uses `?preview=true`.

**Image upload fails**  
Check file type/size, Supabase storage buckets, and Vercel `SUPABASE_SERVICE_ROLE_KEY`.

**Products disappear after deploy**  
You may be in localStorage mode on a new browser; connect Supabase env vars on Vercel.

**Can I have multiple admins?**  
Yes — create each user in Supabase Auth and add a row to `admin_users` with role `admin` or `editor`.

**How do I change the WhatsApp number?**  
Settings → General / Store (depending on tab layout) or `site_config` settings JSON.

## Keyboard & UX

- Sidebar collapses on desktop (preference saved in `localStorage`).
- Mobile: hamburger opens sidebar overlay.
- Help panel (?) in the bottom-right for quick tips.
