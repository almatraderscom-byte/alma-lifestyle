# ALMA Lifestyle

Next.js 16 storefront (Bangla editorial UI) and English admin dashboard for ALMA Lifestyle, Bangladesh. Data is stored in **Supabase** when configured, with **localStorage fallback** for local development without a database.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 9+ |
| Git | any recent |
| Supabase account | optional for offline dev |
| Supabase CLI | optional (`npx supabase`) |

## Quick start (local)

```bash
git clone <your-repo-url>
cd alma-lifestyle
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase keys (see below)
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Legacy admin login (no Supabase Auth): `admin@alma.com` / `admin123`

> **Note:** Do not set `NODE_ENV=development` in `.env.local` — it breaks `npm run build`. Next.js sets `NODE_ENV` automatically.

Without Supabase env vars, the admin panel uses **localStorage** and the storefront uses static catalog fallbacks. A banner appears in admin when in this mode.

## Supabase setup

### 1. Create a project

1. [supabase.com](https://supabase.com) → New project.
2. Copy **Project URL**, **anon key**, and **service role key** (Settings → API).

### 2. Environment variables

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_SLUG=alma-lifestyle
```

Never commit `.env.local` or the service role key.

### 3. Run migrations

**CLI:**

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Manual:** run each file in `supabase/migrations/` in order (`001` … `005`) in the SQL Editor.

Optional seed:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

### 4. Storage buckets

Migration `003_storage_buckets.sql` creates public buckets:

- `product-images`
- `homepage-images`

Verify under **Storage** in the dashboard.

### 5. Admin user (production)

1. Supabase → **Authentication** → create user.
2. SQL Editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('AUTH_USER_UUID', 'you@example.com', 'admin');
```

## Vercel deployment

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Add environment variables from [`vercel.env.production.example`](./vercel.env.production.example).
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. Run migrations against the **production** Supabase project.
5. Deploy `main`.

Full steps: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

Enable **Vercel Analytics** in the project dashboard (Analytics + Speed Insights are wired in the app).

## Admin panel

| Area | Path |
|------|------|
| Dashboard | `/admin` |
| Products | `/admin/products` |
| Categories / Collections | `/admin/products/categories`, `/collections` |
| Orders | `/admin/orders` |
| Homepage builder | `/admin/homepage` |
| Settings | `/admin/settings` |

Guide: [`docs/ADMIN_GUIDE.md`](./docs/ADMIN_GUIDE.md)

## API (`/api/v1`)

| Route | Methods | Auth |
|-------|---------|------|
| `/api/v1/products` | GET, POST | POST: admin |
| `/api/v1/products/[id]` | GET, PATCH, DELETE | PATCH/DELETE: admin |
| `/api/v1/categories` | GET, POST | `?admin=true` for all |
| `/api/v1/collections` | GET, POST | `?admin=true` for all |
| `/api/v1/orders` | GET, POST | POST: public (checkout) |
| `/api/v1/homepage-config` | GET, PUT | PUT: admin |
| `/api/v1/settings` | GET, PUT | PUT: admin |
| `/api/v1/upload` | POST | admin |

Response shape: `{ "status": "success", "data": ... }` or `{ "status": "error", "error": "...", "code": "..." }`.

API routes are rate-limited in `src/middleware.ts` (per IP).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest |

## Architecture

- **Storefront:** Server components + ISR (`revalidate = 60`), Bangla UI, config-driven homepage.
- **Admin:** Client components, `admin-store` → `/api/v1/*` when Supabase configured.
- **Database:** PostgreSQL via Supabase, RLS in `002_rls_policies.sql`.
- **Storage:** Supabase buckets for product/homepage images.

See also: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Admin “local storage mode” banner | Set all Supabase env vars; restart dev server |
| `npm run build` fails / React errors | Remove `NODE_ENV` from `.env.local` |
| API 429 | Too many requests; wait or adjust rate limits in middleware |
| Images not loading | Check buckets are public; Supabase URL in `next.config.ts` |
| Homepage changes delayed | ISR 60s — wait or redeploy |
| `supabase link` needs token | Run `npx supabase login` or set `SUPABASE_ACCESS_TOKEN` |
| Migrations fail on existing DB | Schema may differ — see `docs/DEPLOYMENT.md` |

## Production checklist

Before launch, verify:

- [ ] `npm run type-check` and `npm run build` pass
- [ ] No secrets in git (only `.env.example` / `vercel.env.production.example`)
- [ ] Vercel env vars set (including service role)
- [ ] Migrations applied; storage buckets exist
- [ ] Smoke test: storefront checkout + admin login + upload
- [ ] Custom domain + SSL (Vercel)
- [ ] Supabase backups enabled

## Security

- Service role key: **server only** (API routes, uploads).
- `/admin` protected by middleware session cookie.
- RLS enabled on tables; public read where intended.
- No hardcoded API keys in source.

## License

Private — ALMA Lifestyle.
