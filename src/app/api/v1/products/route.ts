/**
 * GET  /api/v1/products — Paginated catalog (public by default).
 *   Public: published, non-deleted only; public mapper (no admin fields).
 *   Admin: ?admin=true + session — drafts/deleted optional via query.
 *   Query: page, limit, category, published, search, sort, sortDir, designGroup, includeDeleted
 *
 * POST /api/v1/products — Create product (admin session required).
 */
import type { NextRequest } from 'next/server';
import { ProductsListQuerySchema, AdminProductBodySchema } from '@/lib/api-validation';
import { mapDbProductToAdmin } from '@/lib/mappers/admin-product';
import {
  isMatchingDesignGroup,
  mapDesignGroupToCatalogListing,
} from '@/lib/mappers/catalog-product';
import {
  mapDbProductToPublic,
  type PublicApiDesignGroupListItem,
  type PublicApiProduct,
} from '@/lib/mappers/public-product';
import { getProducts } from '@/server/db/queries/products';
import { createAdminProduct } from '@/server/db/queries/products-mutations';
import { getProductCollectionIds } from '@/server/db/queries/products-mutations';
import { getCategories } from '@/server/db/queries/categories';
import { getBrandId } from '@/server/db/brand';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin, withPublicDb } from '@/server/api/handler';
import {
  revalidateStorefront,
  STOREFRONT_PATHS,
} from '@/server/cache/revalidate';
import type { AdminProduct } from '@/lib/admin-store';
import type { ProductWithRelations } from '@/server/db/schema';
import type { ProductType } from '@/lib/product-design-types';
import { typeLabelsForDesignGroup } from '@/lib/product-design-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function groupRowsForDesignGroupAdmin(
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

function groupRowsForDesignGroupPublic(
  rows: ProductWithRelations[],
  publicById: Map<string, PublicApiProduct>
): PublicApiDesignGroupListItem[] {
  const byGroup = new Map<string, ProductWithRelations[]>();

  for (const row of rows) {
    const gid = row.design_group_id;
    if (!gid || row.product_type === 'simple') continue;
    const list = byGroup.get(gid) ?? [];
    list.push(row);
    byGroup.set(gid, list);
  }

  const items: PublicApiDesignGroupListItem[] = [];

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
        .map((m) => publicById.get(m.id)!)
        .filter(Boolean),
    });
  }

  return items.sort((a, b) => a.designGroupName.localeCompare(b.designGroupName));
}

function methodNotAllowed() {
  return apiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
}

async function loadCategoryMap() {
  const brandId = await getBrandId();
  const categories = await getCategories(brandId);
  return new Map(categories.map((c) => [c.id, c]));
}

export async function GET(request: NextRequest) {
  const adminMode = request.nextUrl.searchParams.get('admin') === 'true';

  if (adminMode) {
    return withAdmin(request, async () => {
      const params = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = ProductsListQuerySchema.safeParse(params);
      if (!parsed.success) {
        return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
      }

      const { page, limit, category, published, search, sort, sortDir, designGroup } =
        parsed.data;
      const includeDeleted =
        request.nextUrl.searchParams.get('includeDeleted') === 'true';

      const result = await getProducts({
        page,
        limit: designGroup ? Math.max(limit, 200) : limit,
        categoryId: category,
        published,
        search,
        sort,
        sortDir,
        includeDeleted,
      });

      if (designGroup) {
        const adminRows = await Promise.all(result.data.map(mapRowToAdmin));
        const adminById = new Map(adminRows.map((a) => [a.id, a]));
        const groups = groupRowsForDesignGroupAdmin(result.data, adminById);

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

  return withPublicDb(async () => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = ProductsListQuerySchema.safeParse(params);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const { page, limit, category, search, sort, sortDir, designGroup } = parsed.data;

    const result = await getProducts({
      page,
      limit: designGroup ? Math.max(limit, 200) : limit,
      categoryId: category,
      published: true,
      search,
      sort,
      sortDir,
      includeDeleted: false,
    });

    const catById = await loadCategoryMap();

    const mapRowPublic = (row: ProductWithRelations) =>
      mapDbProductToPublic(row, catById.get(row.category_id) ?? null);

    if (designGroup) {
      const publicRows = result.data.map(mapRowPublic);
      const publicById = new Map(publicRows.map((p) => [p.id, p]));
      const groups = groupRowsForDesignGroupPublic(result.data, publicById);

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

    const data = result.data.map(mapRowPublic);

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
    if (created.status === 'published') {
      revalidateStorefront(STOREFRONT_PATHS.product(created.slug));
    }
    return apiSuccess(created, { status: 201 });
  });
}

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
