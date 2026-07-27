-- A slug may not change without somewhere for the old URL to go.
--
-- The storefront has never had a redirect of any kind (2026-07-27: grep for 301
-- across the repo returned nothing). That is why product slugs are effectively
-- frozen: renaming one would 404 the old URL and throw away whatever ranking
-- that page has earned. One product — "ইসলামিক ৭টি বইয়ের কম্বো প্যাকেজ Product
-- Code: 7-b" — literally carries a Bangla sentence as its slug because of it.
--
-- This table is the missing half. A rename writes the new slug AND a row here,
-- in the same operation; the product page serves a permanent redirect for the
-- old path instead of a 404.
CREATE TABLE IF NOT EXISTS product_redirects (
  from_slug   TEXT PRIMARY KEY,
  to_slug     TEXT NOT NULL,
  -- Why the rename happened, in the owner's words. A redirect with no reason is
  -- impossible to audit a year later.
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Who/what performed it: 'agent' | 'admin' | 'migration'.
  created_by  TEXT NOT NULL DEFAULT 'agent',
  CONSTRAINT product_redirects_no_self CHECK (from_slug <> to_slug)
);

-- Following a chain (a → b → c) is one lookup per hop; the index keeps that cheap
-- and lets a future job flatten chains.
CREATE INDEX IF NOT EXISTS product_redirects_to_slug_idx ON product_redirects (to_slug);

-- Public storefront may READ redirects (the page resolves them); only the
-- service role writes.
ALTER TABLE product_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_redirects_public_read ON product_redirects;
CREATE POLICY product_redirects_public_read
  ON product_redirects FOR SELECT
  USING (true);
