# New Supabase production project (alma-lifestyle-prod)

Use this when the old project (`htlqgyytlojtcjpdbitp`) has the wrong schema. **Do not use the old project for production.**

## Option 1 — Automated (recommended)

### 1. Create a Supabase access token

[Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens) → Generate token (`sbp_...`).

### 2. Get your organization ID

```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
npx supabase orgs list
```

Copy the `id` for **almatraderscom-byte's Org**.

### 3. Run bootstrap (creates project + migrations + seed + `.env.local`)

```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
export SUPABASE_ORG_ID=your-org-id-from-step-2
export SUPABASE_DB_PASSWORD='use-a-strong-password-save-it'

npm run bootstrap:supabase
```

This will:

1. Create project **alma-lifestyle-prod** in **Tokyo** (`ap-northeast-1`)
2. Run migrations `001`–`005` and `supabase/seed.sql`
3. Ensure storage buckets `product-images` and `homepage-images` (public)
4. Write `.env.local` with new URL and keys
5. Run `npm run verify:production` (must pass)

### Already created the project in the dashboard?

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
export SUPABASE_PROJECT_REF=your-new-project-ref
export SUPABASE_DB_PASSWORD='your-db-password'

npm run bootstrap:supabase -- --skip-create
```

---

## Option 2 — Manual (dashboard)

### Steps 1–3: Dashboard

1. [supabase.com](https://supabase.com) → **New project**
   - Name: `alma-lifestyle-prod`
   - Org: almatraderscom-byte's Org
   - Region: Tokyo (`ap-northeast-1`)
   - Strong database password (save it)
2. **Settings → API** — copy Project URL, anon key, service_role key
3. **Storage** — create public buckets `product-images`, `homepage-images`  
   (Or skip if you run migration `003`.)

### Step 4: Migrations

**CLI:**

```bash
npx supabase login
npx supabase link --project-ref YOUR_NEW_REF
npx supabase db push --include-seed
```

**SQL Editor:** Run each file in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_buckets.sql`
4. `supabase/migrations/004_site_config.sql`
5. `supabase/migrations/005_admin_users.sql`
6. `supabase/seed.sql`

### Step 5: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_SLUG=alma-lifestyle
```

Do **not** set `NODE_ENV` in `.env.local`.

### Step 6: Verify

```bash
npm run verify:production
npm run dev
```

---

## After success

1. Update **Vercel** env vars with the **new** URL and keys (not the old project).
2. Deprecate old project `htlqgyytlojtcjpdbitp` in the dashboard (optional pause/delete).
3. Run production smoke test from `docs/PRODUCTION_CHECKLIST.md`.
