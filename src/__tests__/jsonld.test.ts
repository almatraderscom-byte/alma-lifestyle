import { describe, it, expect } from 'vitest';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld-helpers';
import type { CatalogProduct } from '@/lib/products-data';

const BASE = 'https://almatraders.com';

function mockProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: 'prod-1',
    slug: 'royal-navy-panjabi',
    title: 'রয়্যাল নেভি পাঞ্জাবি',
    price: 2500,
    description: 'Premium panjabi',
    categorySlug: 'panjabi',
    categoryName: 'পাঞ্জাবি',
    colors: [],
    sizes: ['M', 'L'],
    rating: 4.5,
    reviewCount: 10,
    aspectRatio: '3/4',
    materialCare: '',
    deliveryInfo: '',
    returnPolicy: '',
    images: [{ id: '1', bgClass: 'bg-maroon', url: 'https://cdn.example/p.jpg' }],
    popularScore: 1,
    createdAt: Date.now(),
    stock: 5,
    ...overrides,
  } as CatalogProduct;
}

describe('jsonld helpers', () => {
  it('productJsonLd returns Product schema with absolute BDT offer URL', () => {
    const data = productJsonLd(mockProduct(), BASE);
    expect(data['@type']).toBe('Product');
    expect(data.offers.priceCurrency).toBe('BDT');
    expect(data.offers.price).toBe(2500);
    expect(data.offers.url).toBe(`${BASE}/products/royal-navy-panjabi`);
    expect(data.offers.availability).toBe('https://schema.org/InStock');
    expect(data.image).toEqual(['https://cdn.example/p.jpg']);
  });

  it('productJsonLd marks OutOfStock when no sizes', () => {
    const data = productJsonLd(mockProduct({ sizes: [] }), BASE);
    expect(data.offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('breadcrumbJsonLd returns BreadcrumbList with absolute items', () => {
    const data = breadcrumbJsonLd(
      [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Panjabi', path: '/products/royal-navy-panjabi' },
      ],
      BASE
    );
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0].item).toBe(`${BASE}/`);
    expect(data.itemListElement[2].item).toBe(`${BASE}/products/royal-navy-panjabi`);
  });
});
