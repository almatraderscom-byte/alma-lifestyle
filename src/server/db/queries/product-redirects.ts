import { getSupabaseAdmin } from '../client';

/**
 * Where an old product URL should go.
 *
 * The storefront had no redirect of any kind until 2026-07-27, which is why
 * product slugs were effectively frozen: renaming one would 404 the old URL and
 * throw away its ranking. One product still carries a whole Bangla sentence as
 * its slug for exactly that reason.
 *
 * A rename now writes the new slug and a `product_redirects` row together, and
 * the product page resolves the old path here before it gives up.
 */

/** A rename can be renamed again; follow the chain, but never forever. */
const MAX_HOPS = 5;

export async function resolveProductRedirect(
  fromSlug: string
): Promise<string | null> {
  const start = fromSlug.trim();
  if (!start) return null;

  const supabase = getSupabaseAdmin();
  const seen = new Set<string>([start]);
  let current = start;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    // Cast, like every other query on a table outside the generated Database map
    // (see landing-content.ts) — the row shape is pinned by ProductRedirect.
    const { data, error } = await (supabase
      .from('product_redirects' as never)
      .select('to_slug')
      .eq('from_slug' as never, current as never)
      .maybeSingle() as unknown as Promise<{
        data: { to_slug: string } | null;
        error: unknown;
      }>);

    // A missing table (migration not applied yet) or any read failure must never
    // break a product page — it simply means "no redirect", i.e. today's 404.
    if (error) return null;
    if (!data?.to_slug) return current === start ? null : current;

    const next = String(data.to_slug);
    // A loop (a → b → a) would otherwise hang the request.
    if (seen.has(next)) return null;
    seen.add(next);
    current = next;
  }

  // Chain longer than MAX_HOPS: send them to the last hop we resolved rather
  // than to a 404. Better a near-miss than a dead end.
  return current === start ? null : current;
}
