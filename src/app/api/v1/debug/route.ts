import { NextResponse } from 'next/server';
import { isSupabaseConfigured, isSupabaseAdminConfigured } from '@/lib/supabase/config';

export async function GET() {
  const debug: Record<string, unknown> = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `SET (length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})`
        : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? `SET (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`
        : 'MISSING',
      NEXT_PUBLIC_USE_API: process.env.NEXT_PUBLIC_USE_API ?? 'NOT SET',
    },
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: isSupabaseAdminConfigured(),
  };

  try {
    const { supabaseAdmin } = await import('@/server/db/client');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const redactedUrl = url ? `${url.slice(0, 30)}…` : 'none';
    console.log('[API /debug] Supabase URL (redacted):', redactedUrl);

    const { data: brands, error: brandsError } = await supabaseAdmin
      .from('brands')
      .select('id, name, slug')
      .limit(5);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, sku')
      .limit(5);
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    Object.assign(debug, {
      db: {
        brands: { data: brands, error: brandsError?.message },
        products: { data: products, error: productsError?.message },
        categories: { data: categories, error: categoriesError?.message },
      },
    });
  } catch (err) {
    Object.assign(debug, {
      db: {
        connectionError: err instanceof Error ? err.message : String(err),
      },
    });
  }

  return NextResponse.json(debug);
}
