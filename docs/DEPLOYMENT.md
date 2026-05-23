# ALMA Lifestyle — Production deployment guide

This guide covers deploying the Next.js app to Vercel with Supabase as the database and storage backend.

## Prerequisites

- GitHub repository with `main` branch up to date
- [Supabase](https://supabase.com) project (production)
- [Vercel](https://vercel.com) account linked to GitHub
- Domain name (optional — Vercel provides `*.vercel.app`)

## 1. Supabase production setup

### Create project

1. Create a new Supabase project (or use your existing production project).
2. Note **Project URL**, **anon key**, and **service role key** (Settings → API).

### Run migrations

Using the Supabase CLI (recommended):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or run SQL manually in **SQL Editor** in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_buckets.sql`
4. `supabase/migrations/004_site_config.sql`
5. `supabase/migrations/005_admin_users.sql`

Optional seed for staging:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

### Storage buckets

Migration `003` creates public buckets:

- `product-images`
- `homepage-images`

Confirm under **Storage** in the dashboard.

### Admin users

1. **Authentication** → create a user (email + password).
2. SQL Editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('USER-UUID-FROM-AUTH', 'admin@yourcompany.com', 'admin');
```

### Backups

Enable **Point-in-Time Recovery** (paid plans) or schedule logical backups via Supabase dashboard / CLI. Export critical tables before major migrations.

## 2. Vercel deployment

### Import project

1. Vercel → **Add New** → **Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `npm run build` (default).
4. Output: default.

### Environment variables

Add variables from `vercel.env.production.example` for **Production** (and **Preview** if you use preview deployments):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server only |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_BRAND_SLUG` | Usually `alma-lifestyle` |

Do **not** set `NODE_ENV` manually; Vercel sets `production` automatically.

### Deploy

Push to `main` or click **Deploy**. Verify build logs complete without errors.

### Custom domain

1. Vercel → Project → **Settings** → **Domains**.
2. Add your domain and follow DNS instructions (CNAME to `cname.vercel-dns.com` or A records).
3. SSL is provisioned automatically.
4. Update `NEXT_PUBLIC_APP_URL` to the production URL and redeploy.

## 3. Post-deploy smoke test

- [ ] Homepage loads (`/`)
- [ ] Products list and detail pages
- [ ] Add to cart → checkout → order confirmation (`ALM-…` order number)
- [ ] Admin login (`/admin/login`)
- [ ] Dashboard stats, product CRUD, image upload
- [ ] Homepage builder save + `?preview=true`
- [ ] Settings save

## 4. Monitoring

### Vercel Analytics

`@vercel/analytics` and `@vercel/speed-insights` are included in the root layout. Enable **Analytics** in the Vercel project dashboard (free tier available).

### Sentry (optional)

1. Create a Sentry project.
2. Install `@sentry/nextjs` and follow their Next.js setup.
3. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel.
4. Configure alerts for unhandled errors and API 5xx spikes.

### Logs

- **Vercel** → Deployments → Functions / Runtime logs
- **Supabase** → Logs → API / Postgres

## 5. Rollback

### Vercel

1. **Deployments** → select a previous successful deployment → **Promote to Production**.

### Database

Restore from Supabase backup or re-run a known-good migration. Avoid destructive `db reset` on production without a backup.

## 6. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Admin shows “local storage mode” banner | `SUPABASE_SERVICE_ROLE_KEY` missing on Vercel |
| API 503 / not configured | All three Supabase env vars set; redeploy after changes |
| Images 404 | Bucket public; `next.config.ts` allows `**.supabase.co` storage URLs |
| ISR stale content | Wait 60s (`revalidate = 60`) or redeploy |
| 429 on API | Rate limit in middleware; reduce burst traffic or add Redis limiter |
| Build fails locally | Unset `NODE_ENV=development` in `.env.local` when running `npm run build` |

## 7. CI checks before release

```bash
npm run type-check
npm run lint
npm run build
```

## Security reminders

- Never commit `.env.local` or service role keys.
- RLS is enabled in `002_rls_policies.sql`; service role bypasses RLS — keep it server-only.
- `/admin` routes require session cookie (see `src/middleware.ts`).
- Rotate service role key if exposed.
