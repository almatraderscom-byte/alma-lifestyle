/**
 * A URL slug as it actually arrives from the router.
 *
 * Next hands `params.slug` over exactly as it sits in the path, so a product
 * whose slug contains anything outside ASCII arrives percent-encoded:
 *
 *   /products/ইসলামিক ৭টি বইয়ের কম্বো প্যাকেজ Product Code: 7-b
 *     → params.slug === "%E0%A6%87%E0%A6%B8%E0%A6%B2...%207-b"
 *
 * Every lookup downstream compares that against plain text in the database, so
 * an ASCII slug matches and a Bangla one never can. That is why the 2026-07-27
 * redirect table looked correct in the database and still served a 404 on the
 * live site: the resolver was searching for the *encoded* string.
 */
export function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    // A malformed escape ("%E0%") throws. The raw value is still the best guess
    // we have, and a lookup miss is a 404 — never a broken page.
    return raw;
  }
}

/**
 * One comparison key for text that can be stored in more than one Unicode form.
 *
 * Bangla makes this unavoidable: য় is either one codepoint (U+09DF) or two
 * (U+09AF + U+09BC), the two look identical, and they are not equal. Worse, NFC
 * does *not* put them back together — U+09DF is on Unicode's composition
 * exclusion list — so "just normalise both sides to NFC" silently fails on
 * exactly the slug this code exists for. Full decomposition (NFD) is the one
 * form both spellings agree on.
 *
 * Use this to COMPARE. Never write it back to the database as a slug.
 */
export function slugComparisonKey(slug: string): string {
  return slug.normalize('NFD').trim();
}

/**
 * Forms worth asking the database for directly, best guess first. An exact hit
 * is one indexed lookup; anything subtler falls back to comparing by
 * slugComparisonKey.
 */
export function slugMatchCandidates(slug: string): string[] {
  const out: string[] = [];
  for (const form of [slug, slug.normalize('NFC'), slug.normalize('NFD')]) {
    if (form && !out.includes(form)) out.push(form);
  }
  return out;
}
