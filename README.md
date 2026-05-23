# ALMA Lifestyle

Next.js storefront and admin panel for ALMA Lifestyle (Bangladesh). The customer site uses Bangla editorial UI; the admin dashboard is in English.

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (optional for local-only dev)

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) and note the project URL and API keys.

### 2. Run database migrations

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project, or run SQL manually in the SQL editor in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_buckets.sql`
4. `supabase/migrations/004_site_config.sql`
5. `supabase/migrations/005_admin_users.sql`

Then seed development data (optional):

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

Or with the CLI:

```bash
supabase db push
supabase db execute -f supabase/seed.sql
```

### 3. Storage buckets

Migration `003_storage_buckets.sql` creates public buckets `product-images` and `homepage-images`. Confirm they appear under **Storage** in the Supabase dashboard.

### 4. Create an admin user (Supabase Auth)

1. In Supabase → **Authentication** → **Users**, create a user (email + password).
2. Copy the user UUID.
3. In the SQL editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR-USER-UUID', 'you@example.com', 'admin');
```

### 5. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the browser)
- `NEXT_PUBLIC_APP_URL`

### 6. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

**Without Supabase:** the app uses localStorage for admin data and static catalog content on the storefront. A banner appears in the admin panel.

**Default legacy admin login** (when not using Supabase Auth): `admin@alma.com` / `admin123`

## API

REST routes live under `/api/v1/`:

| Route | Methods | Notes |
|-------|---------|--------|
| `/api/v1/products` | GET, POST | Paginated catalog; POST requires admin |
| `/api/v1/products/[id]` | GET, PATCH, DELETE | |
| `/api/v1/categories` | GET, POST | `?admin=true` for all categories |
| `/api/v1/collections` | GET, POST | `?admin=true` for admin list |
| `/api/v1/orders` | GET, POST | POST is public (checkout) |
| `/api/v1/homepage-config` | GET, PUT | |
| `/api/v1/settings` | GET, PUT | GET returns public fields only |
| `/api/v1/upload` | POST | Multipart `file`, optional `folder`, `bucket` |

Responses: `{ status: 'success', data }` or `{ status: 'error', error }`.

## Deploy on Vercel

1. Push the repo and import the project in Vercel.
2. Add the same environment variables as `.env.local`.
3. Run migrations against the production Supabase project.
4. Deploy. Storefront pages use ISR (`revalidate = 60`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript |
