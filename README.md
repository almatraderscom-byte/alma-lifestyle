# ALMA Lifestyle

[![CI](https://github.com/almatraderscom-byte/alma-lifestyle/actions/workflows/ci.yml/badge.svg)](https://github.com/almatraderscom-byte/alma-lifestyle/actions/workflows/ci.yml)

Next.js 16 storefront (Bangla editorial UI) and English admin dashboard for ALMA Lifestyle, Bangladesh. Production data lives in **Supabase**. Local development can run without Supabase using **localStorage and static fallbacks only** — that path is not supported in production.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 9+ |
| Git | any recent |
| Supabase account | required for production |
| Supabase CLI | optional (`npx supabase`) |

## Getting started (local)

```bash
git clone <your-repo-url>
cd alma-lifestyle
npm install
cp .env.example .env.local
# Optional: add Supabase keys (see below) for full-stack dev
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

> **Note:** Do not set `NODE_ENV=development` in `.env.local` — it breaks `npm run build`. Next.js sets `NODE_ENV` automatically.

**Without Supabase env vars** (and with `VERCEL_ENV` unset), the app starts for local dev. The admin panel may use **localStorage** and the storefront may use static catalog fallbacks; a banner appears in admin. This mode is **development-only**. On Vercel Production, missing required env vars cause the Node server to **fail at boot** (`validateEnvOrThrow` in `src/instrumentation.ts`).

With Supabase configured locally, use Supabase Auth for admin (see [Supabase setup](#supabase-setup)). Legacy `admin@alma.com` / `admin123` may still work until signed-session hardening (SEC-004) is deployed.

## Supabase setup

**Wrong schema on an old project?** Create a fresh production DB: [docs/SUPABASE_NEW_PROJECT.md](./docs/SUPABASE_NEW_PROJECT.md) (`npm run bootstrap:supabase`).

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
ADMIN_SESSION_SECRET=your-local-dev-secret-at-least-32-chars
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

## Production deployment

Deploy to Vercel with a production Supabase project. Full steps: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Set **Production** environment variables from [`vercel.env.production.example`](./vercel.env.production.example) (Supabase URL/keys, `NEXT_PUBLIC_APP_URL`, `ADMIN_SESSION_SECRET`, optional Upstash/Sentry/CSP vars per merged infra PRs).
3. Run migrations against the **production** Supabase project.
4. Deploy `main`.

**Boot-time validation:** On Vercel Production (`VERCEL_ENV=production`), `validateEnvOrThrow()` runs in `src/instrumentation.ts` before the server accepts traffic. Missing or invalid required vars produce a clear startup error instead of silent localStorage fallback.

**Pre-launch verification:** [`docs/PRE_LAUNCH_CHECKLIST.md`](./docs/PRE_LAUNCH_CHECKLIST.md) — copy-paste smoke tests for the owner.

Enable **Vercel Analytics** in the project dashboard (Analytics + Speed Insights are wired in the app).

## Architecture decisions

Incremental hardening and SSR work landed as focused PRs:

| Track | Scope |
|-------|--------|
| **SEC-001 – SEC-004** | API hardening, admin auth, signed HttpOnly admin sessions |
| **SEO-001** | `robots.txt`, sitemap, JSON-LD, canonical URLs |
| **SSR-001 / 002 / 003** | Server-rendered storefront paths (home, PLP, PDP) |
| **CACHE-001** | On-demand ISR revalidation after admin writes |
| **ERR-001 + OBS-001** | Branded error boundaries, Sentry reporting |
| **INFRA-001 + SEC-005** | Upstash rate limiting, CSP / HSTS headers |
| **CI-001** | GitHub Actions (typecheck, lint, build, Vitest) |
| **PERF-001 / 002** | Bulk `collection_products` fetches (N+1 elimination) |

See also: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

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

API routes are rate-limited in `src/middleware.ts` (per IP; Redis when INFRA-001 is merged).

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
- **Admin:** Client components, `admin-store` → `/api/v1/*` when Supabase is configured.
- **Database:** PostgreSQL via Supabase, RLS in `002_rls_policies.sql`.
- **Storage:** Supabase buckets for product/homepage images.

## Known gaps / future work

- **ADMIN-001:** Admin dashboard still client-fetched (UX; not a launch blocker).
- **Collections PLP:** Some collection pages still use mock taxonomy from `mock-data.ts` (partially deprecated).
- **E2E:** No Playwright/Cypress suite yet — manual checklist + Vitest only.
- **Customer auth** and abandoned-cart recovery.
- **Payments:** COD-only; bKash / Nagad / SSLCommerz not integrated.
- **Order confirmation** email/SMS not wired.
- **Multi-currency / UAE locale** not implemented.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Vercel deploy fails immediately on Production | Check build logs for `[env] Invalid configuration`; set vars from `vercel.env.production.example` |
| Admin “local storage mode” banner (local dev) | Set Supabase env vars; restart dev server |
| `npm run build` fails / React errors | Remove `NODE_ENV` from `.env.local` |
| API 429 | Too many requests; wait or adjust rate limits |
| Images not loading | Check buckets are public; Supabase URL in `next.config.ts` |
| Homepage changes delayed | ISR 60s — wait or trigger on-demand revalidation (CACHE-001) |
| `supabase link` needs token | Run `npx supabase login` or set `SUPABASE_ACCESS_TOKEN` |
| Migrations fail on existing DB | Schema may differ — see `docs/DEPLOYMENT.md` |

## Security

- Service role key: **server only** (API routes, uploads).
- `/admin` protected by middleware session cookie.
- RLS enabled on tables; public read where intended.
- No hardcoded API keys in source.

## License

Private — ALMA Lifestyle.
