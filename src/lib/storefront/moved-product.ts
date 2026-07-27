import {
  decodeSlugParam,
  slugComparisonKey,
  slugMatchCandidates,
} from '@/lib/storefront/slug-param';

/**
 * Where a moved product URL goes, resolved early enough to answer with a real
 * status code.
 *
 * The page component can also resolve a redirect, but a product page is
 * statically generated (`revalidate = 60`), and Next cannot put a 308 on a
 * response it has already begun to stream: it finishes the job with
 * `<meta http-equiv="refresh">` inside a **200**. A person still arrives; a
 * crawler is told the old URL answered fine, which is the opposite of the point.
 * Middleware runs before any of that, so the redirect here is a true 308.
 *
 * This module is edge-safe on purpose — plain `fetch` against PostgREST, no
 * supabase-js, no Node APIs.
 */

/** What a healthy slug looks like: lowercase ASCII words joined by hyphens. */
const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A rename can be renamed again; follow the chain, but never forever. */
const MAX_HOPS = 5;

function readEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Redirects are public-read by policy (migration 017), so the anon key is
  // enough; the service role is only a fallback for environments that set it.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function query(
  env: { url: string; key: string },
  search: string
): Promise<Array<{ from_slug?: string; to_slug?: string }> | null> {
  try {
    const res = await fetch(`${env.url}/rest/v1/product_redirects?${search}`, {
      headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as Array<{ from_slug?: string; to_slug?: string }>;
  } catch {
    // The storefront must not break because a lookup failed. No redirect just
    // means the page answers as it would have anyway.
    return null;
  }
}

/**
 * Renames are rare, so the whole table fits in one response. Reading it lets us
 * compare by slugComparisonKey instead of trusting the incoming link to be
 * spelled in the same Unicode form as the stored one — which the 7-b slug is
 * not: the database holds য় precomposed, and no standard normalisation of an
 * incoming link reproduces that.
 */
const SCAN_LIMIT = 500;

async function lookupOneHop(slug: string): Promise<string | null> {
  const env = readEnv();
  if (!env) return null;

  // Fast path: an exact (or trivially normalised) match is one indexed lookup.
  for (const candidate of slugMatchCandidates(slug)) {
    const rows = await query(
      env,
      `select=to_slug&from_slug=eq.${encodeURIComponent(candidate)}&limit=1`
    );
    if (rows === null) return null;
    const to = rows[0]?.to_slug;
    if (to) return String(to);
  }

  // Slow path: compare every stored slug on equal terms.
  const all = await query(env, `select=from_slug,to_slug&limit=${SCAN_LIMIT}`);
  if (!all) return null;
  const wanted = slugComparisonKey(slug);
  for (const row of all) {
    if (row.from_slug && row.to_slug && slugComparisonKey(row.from_slug) === wanted) {
      return String(row.to_slug);
    }
  }

  return null;
}

/**
 * The slug this product path should be served at, or null to leave the request
 * alone.
 *
 * Only non-canonical slugs are looked up — a Bangla sentence, spaces, capitals,
 * a product code. Those are the only slugs the renaming tool is allowed to move
 * away from, and it keeps every ordinary product page at zero extra queries. A
 * rename of an already-clean slug still redirects, one layer down, via the page.
 */
export async function resolveMovedProductSlug(rawSlug: string): Promise<string | null> {
  const slug = decodeSlugParam(rawSlug).trim();
  if (!slug || CANONICAL_SLUG.test(slug)) return null;

  const seen = new Set<string>([slug]);
  let current = slug;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const next = await lookupOneHop(current);
    if (!next) break;
    // A loop (a → b → a) would otherwise hang the request.
    if (seen.has(next)) return null;
    seen.add(next);
    current = next;
  }

  return current === slug ? null : current;
}
