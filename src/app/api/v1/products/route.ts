/**
 * GET  /api/v1/products — Paginated catalog (public).
 *   Query: page, limit, category, published, search, sort, sortDir, designGroup
 *   designGroup=true → one row per matching design group with nested members
 *   Response: { status, data: { data, pagination } }
 *
 * POST /api/v1/products — Create product (admin session required).
 */
import type { NextRequest } from 'next/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { ProductsListQuerySchema, AdminProductBodySchema } from '@/lib/api-validation';
import { mapDbProductToAdmin } from '@/lib/mappers/admin-product';
import {
  isMatchingDesignGroup,
  mapDesignGroupToCatalogListing,
} from '@/lib/mappers/catalog-product';
import { getProducts } from '@/server/db/queries/products';
import { createAdminProduct } from '@/server/db/queries/products-mutations';
import { getProductCollectionIds } from '@/server/db/queries/products-mutations';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import type { AdminProduct } from '@/lib/admin-store';
import type { ProductWithRelations } from '@/server/db/schema';
import type { ProductType } from '@/lib/product-design-types';
import { typeLabelsForDesignGroup } from '@/lib/product-design-types';

export interface DesignGroupListItem {
  designGroupId: string;
  designGroupName: string;
  slug: string;
  minPriceBdt: number;
  maxPriceBdt: number;
  types: ProductType[];
  typeLabels: string[];
  members: AdminProduct[];
}

async function mapRowToAdmin(row: ProductWithRelations): Promise<AdminProduct> {
  const collectionIds = await getProductCollectionIds(row.id);
  return mapDbProductToAdmin(row, collectionIds);
}

function groupRowsForDesignGroupApi(
  rows: ProductWithRelations[],
  adminById: Map<string, AdminProduct>
): DesignGroupListItem[] {
  const byGroup = new Map<string, ProductWithRelations[]>();

  for (const row of rows) {
    const gid = row.design_group_id;
    if (!gid || row.product_type === 'simple') continue;
    const list = byGroup.get(gid) ?? [];
    list.push(row);
    byGroup.set(gid, list);
  }

  const items: DesignGroupListItem[] = [];

  for (const [designGroupId, members] of byGroup) {
    if (!isMatchingDesignGroup(members)) continue;

    const listing = mapDesignGroupToCatalogListing(members, undefined);
    const types = (listing.availableTypes ?? []).filter(
      (t): t is ProductType => t !== 'simple'
    );

    items.push({
      designGroupId,
      designGroupName: listing.designGroupName ?? listing.title,
      slug: listing.slug,
      minPriceBdt: listing.priceMin ?? listing.price,
      maxPriceBdt: listing.priceMax ?? listing.price,
      types,
      typeLabels: typeLabelsForDesignGroup(types),
      members: members
        .sort((a, b) => a.display_order - b.display_order)
        .map((m) => adminById.get(m.id)!)
        .filter(Boolean),
    });
  }

  return items.sort((a, b) => a.designGroupName.localeCompare(b.designGroupName));
}

export async function GET(request: NextRequest) {
  const adminOk = isSupabaseAdminConfigured();
  console.log('[API /products] GET handler called, supabaseAdminConfigured:', adminOk);
  if (!adminOk) {
    console.error(
      '[API /products] Supabase not configured — missing NEXT_PUBLIC_SUPABASE_* or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return withPublicDb(async () => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = ProductsListQuerySchema.safeParse(params);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const { page, limit, category, published, search, sort, sortDir, designGroup } =
      parsed.data;

    const result = await getProducts({
      page,
      limit: designGroup ? Math.max(limit, 200) : limit,
      categoryId: category,
      published,
      search,
      sort,
      sortDir,
      includeDeleted: published === undefined,
    });

    if (designGroup) {
      const adminRows = await Promise.all(result.data.map(mapRowToAdmin));
      const adminById = new Map(adminRows.map((a) => [a.id, a]));
      const groups = groupRowsForDesignGroupApi(result.data, adminById);

      return apiSuccess({
        data: groups,
        pagination: {
          page: 1,
          limit: groups.length,
          total: groups.length,
          totalPages: 1,
        },
      });
    }

    const data = await Promise.all(result.data.map(mapRowToAdmin));
    console.log(
      '[API /products] Product IDs:',
      data.map((p) => p.id).slice(0, 5)
    );

    return apiSuccess({
      data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = AdminProductBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const product: AdminProduct = {
      ...parsed.data,
      productType: parsed.data.productType ?? 'simple',
      designGroupId: parsed.data.designGroupId ?? undefined,
      designGroupName: parsed.data.designGroupName ?? undefined,
      ageGroup: parsed.data.ageGroup ?? undefined,
      id: parsed.data.id ?? crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createAdminProduct(product);
    return apiSuccess(created, { status: 201 });
  });
}
