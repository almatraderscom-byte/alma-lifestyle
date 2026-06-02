import { describe, it, expect } from 'vitest';
import {
  isProductVisibleOnStorefront,
  mapDbProductToPublic,
} from '@/lib/mappers/public-product';
import type { ProductWithRelations } from '@/server/db/schema';

function mockDbRow(overrides: Partial<ProductWithRelations> = {}): ProductWithRelations {
  const base = {
    id: '11111111-1111-1111-1111-111111111111',
    brand_id: 'brand-1',
    category_id: '22222222-2222-2222-2222-222222222222',
    sku: 'SKU-SECRET',
    slug: 'test-product',
    title: 'Test Product',
    description: 'Full description',
    price_bdt: 1999,
    price_usd: 18,
    price_aed: 66,
    cost_usd: 5,
    published: true,
    published_at: new Date().toISOString(),
    product_type: 'simple',
    design_group_id: null,
    design_group_name: null,
    age_group: null,
    display_order: 3,
    fabric: 'Cotton',
    care_instructions: 'Dry clean',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_images: [
      {
        id: 'img-1',
        product_id: '11111111-1111-1111-1111-111111111111',
        url: 'https://example.com/img.jpg',
        sort_order: 0,
        alt_text: null,
        created_at: new Date().toISOString(),
      },
    ],
    product_variants: [
      {
        id: 'var-1',
        product_id: '11111111-1111-1111-1111-111111111111',
        sku: 'VAR-1',
        size: 'M',
        color: 'Blue',
        stock_quantity: 4,
        reserved_quantity: 0,
        sku_variant: 'VAR-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  } as ProductWithRelations;

  return { ...base, ...overrides };
}

describe('mapDbProductToPublic', () => {
  it('strips admin-only fields from the public shape', () => {
    const row = mockDbRow({
      seo_title: 'SEO Title',
      seo_description: 'SEO Desc',
      seo_keywords: 'kw',
    } as ProductWithRelations);
    const ext = row as ProductWithRelations & {
      tags?: string[];
      deleted_at?: string | null;
    };
    ext.tags = ['tag1'];

    const pub = mapDbProductToPublic(row, { slug: 'panjabi', name: 'Panjabi' });
    const keys = Object.keys(pub);

    expect(keys).not.toContain('sku');
    expect(keys).not.toContain('status');
    expect(keys).not.toContain('costPriceBdt');
    expect(keys).not.toContain('collectionIds');
    expect(keys).not.toContain('displayOrder');
    expect(keys).not.toContain('seoTitle');
    expect(pub.slug).toBe('test-product');
    expect(pub.title).toBeTruthy();
    expect(pub.priceBdt).toBe(1999);
    expect(pub.description).toBe('Full description');
    expect(pub.variants?.length).toBe(1);
    expect(pub.images.length).toBeGreaterThan(0);
  });

  it('isProductVisibleOnStorefront is true only for published non-deleted', () => {
    expect(isProductVisibleOnStorefront(mockDbRow())).toBe(true);
    expect(
      isProductVisibleOnStorefront(mockDbRow({ published: false }))
    ).toBe(false);
    expect(
      isProductVisibleOnStorefront(
        mockDbRow({ deleted_at: new Date().toISOString() } as ProductWithRelations)
      )
    ).toBe(false);
  });
});
