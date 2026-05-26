import { describe, it, expect } from 'vitest';
import { AppSettingsSchema, HomepageConfigSchema } from '@/lib/api-validation';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { getDefaultAppSettings } from '@/lib/admin-settings-types';
import type { HomepageConfig } from '@/lib/homepage-config-types';

/** Minimal config that satisfies strict Zod section schemas (for unit tests). */
function minimalValidHomepageConfig(): HomepageConfig {
  const card = {
    categorySlug: 'panjabi',
    displayName: 'Panjabi',
    subtitle: '120+',
    href: '/products?category=panjabi',
    bgClass: 'bg-maroon' as const,
    imageHint: '',
    imageUrl: '',
  };
  return {
    lastSaved: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        enabled: true,
        order: 0,
        data: {
          caption: 'New',
          title: 'Title',
          subtitle: 'Sub',
          ctaPrimary: 'Shop',
          ctaPrimaryHref: '/products',
          ctaSecondary: 'More',
          ctaSecondaryHref: '/collections',
          backgroundImageUrl: '',
          imageHint: '',
          badges: ['Badge'],
        },
      },
      {
        id: 'featured',
        enabled: true,
        order: 1,
        data: {
          label: 'Featured',
          title: 'Picks',
          viewAllText: 'All',
          viewAllHref: '/products',
          source: 'latest',
          manualProductIds: [],
          productCount: 4,
        },
      },
      {
        id: 'categories',
        enabled: true,
        order: 2,
        data: {
          label: 'Categories',
          title: 'Shop',
          featured: card,
          stacked: [card, { ...card, categorySlug: 'electronics' }, { ...card, categorySlug: 'accessories' }],
        },
      },
    ],
  };
}

describe('HomepageConfigSchema', () => {
  it('accepts a valid minimal homepage config', () => {
    const parsed = HomepageConfigSchema.safeParse(minimalValidHomepageConfig());
    expect(parsed.success).toBe(true);
  });

  it('rejects unknown section id', () => {
    const config = getDefaultHomepageConfig();
    const bad = {
      ...config,
      sections: [
        {
          ...config.sections[0],
          id: 'unknownSection',
        },
      ],
    };
    const parsed = HomepageConfigSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });

  it('rejects malformed featured.productCount', () => {
    const config = getDefaultHomepageConfig();
    const featured = config.sections.find((s) => s.id === 'featured');
    if (!featured || featured.id !== 'featured') {
      throw new Error('expected featured section in default config');
    }
    const bad = {
      ...config,
      sections: config.sections.map((s) =>
        s.id === 'featured'
          ? {
              ...s,
              data: {
                ...featured.data,
                productCount: 6,
              },
            }
          : s
      ),
    };
    const parsed = HomepageConfigSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });

  it('accepts featured.productCount 4, 8, and 12', () => {
    for (const count of [4, 8, 12] as const) {
      const config = minimalValidHomepageConfig();
      const parsed = HomepageConfigSchema.safeParse({
        ...config,
        sections: config.sections.map((s) =>
          s.id === 'featured'
            ? { ...s, data: { ...(s.data as { productCount: number }), productCount: count } }
            : s
        ),
      });
      expect(parsed.success).toBe(true);
    }
  });
});

describe('AppSettingsSchema', () => {
  it('accepts valid default settings', () => {
    const parsed = AppSettingsSchema.safeParse(getDefaultAppSettings());
    expect(parsed.success).toBe(true);
  });

  it('rejects extra unknown fields', () => {
    const parsed = AppSettingsSchema.safeParse({
      ...getDefaultAppSettings(),
      unexpectedField: true,
    });
    expect(parsed.success).toBe(false);
  });
});
