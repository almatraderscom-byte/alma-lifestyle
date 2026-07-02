import Link from 'next/link';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { MURDA_MOSHARI_LAYOUT_KEY, MURDA_MOSHARI_SLUG } from '@/lib/landing-content-types';
import { listLandingContents } from '@/server/db/queries/landing-content';

const FALLBACK_TITLE = 'স্মার্ট মুর্দা মশারী';

export default async function AdminLandingListPage() {
  let rows: { product_slug: string; layout_key: string; updated_at: string }[] = [];

  if (isSupabaseAdminConfigured()) {
    try {
      rows = await listLandingContents();
    } catch {
      rows = [];
    }
  }

  if (rows.length === 0) {
    rows = [
      {
        product_slug: MURDA_MOSHARI_SLUG,
        layout_key: MURDA_MOSHARI_LAYOUT_KEY,
        updated_at: '',
      },
    ];
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Landing Pages</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Custom product landing layouts editable without code deploys.
      </p>
      <ul className="mt-8 divide-y rounded-xl border border-neutral-200 bg-white">
        {rows.map((row) => (
          <li key={row.product_slug} className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="font-medium text-neutral-900">
                {row.product_slug === MURDA_MOSHARI_SLUG ? FALLBACK_TITLE : row.product_slug}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {row.product_slug} · {row.layout_key}
                {row.updated_at
                  ? ` · Updated ${new Date(row.updated_at).toLocaleString('bn-BD')}`
                  : ' · Static defaults (not seeded yet)'}
              </p>
            </div>
            <Link
              href={`/admin/landing/${row.product_slug}`}
              className="text-sm font-medium text-[var(--ob-violet)] hover:underline shrink-0"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
