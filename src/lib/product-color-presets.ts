/** Shared color presets for admin variant entry and storefront swatches. */
export type ProductColorPreset = {
  id: string;
  name: string;
  hex: string;
};

export const PRODUCT_COLOR_PRESETS: ProductColorPreset[] = [
  { id: 'white', name: 'সাদা', hex: '#f5f5f5' },
  { id: 'black', name: 'কালো', hex: '#1a1a1a' },
  { id: 'navy', name: 'নেভি', hex: '#2c3e5c' },
  { id: 'maroon', name: 'মেরুন', hex: '#6b2c3e' },
  { id: 'cream', name: 'ক্রিম', hex: '#f5f0eb' },
  { id: 'green', name: 'সবুজ', hex: '#4a7c59' },
  { id: 'red', name: 'লাল', hex: '#c0392b' },
  { id: 'pink', name: 'গোলাপি', hex: '#e8a0bf' },
  { id: 'yellow', name: 'হলুদ', hex: '#f4d03f' },
  { id: 'blue', name: 'নীল', hex: '#3498db' },
  { id: 'orange', name: 'কমলা', hex: '#e67e22' },
  { id: 'purple', name: 'বেগুনি', hex: '#8e44ad' },
  { id: 'brown', name: 'বাদামি', hex: '#8b7355' },
  { id: 'gray', name: 'ধূসর', hex: '#95a5a6' },
];

export function findColorPresetByName(name: string): ProductColorPreset | undefined {
  const normalized = name.trim().toLowerCase();
  return PRODUCT_COLOR_PRESETS.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.id.toLowerCase() === normalized ||
      c.name === name
  );
}

export function findColorPresetById(id: string): ProductColorPreset | undefined {
  return PRODUCT_COLOR_PRESETS.find((c) => c.id === id);
}

export function colorHexForName(name: string): string {
  return findColorPresetByName(name)?.hex ?? '#cccccc';
}

export function slugifyColorId(name: string): string {
  const preset = findColorPresetByName(name);
  if (preset) return preset.id;
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 24) || 'custom';
}

type VariantLike = { size?: string | null; color?: string | null };

const ONE_SIZE_VALUES = new Set(['one size', 'onesize', 'free size', '—', '-']);

export function isOneSizeLabel(size: string | null | undefined): boolean {
  if (!size) return true;
  return ONE_SIZE_VALUES.has(size.trim().toLowerCase());
}

/** True when variants represent color choices (not a single Default row). */
export function hasColorVariants(variants: VariantLike[] | undefined): boolean {
  if (!variants?.length) return false;
  const colors = variants
    .map((v) => v.color?.trim())
    .filter((c): c is string => Boolean(c && c !== 'Default'));
  return colors.length > 0;
}

/** Build storefront color swatches from DB variant rows. */
export function variantsToCatalogColors(
  variants: VariantLike[] | undefined
): ProductColorPreset[] {
  if (!hasColorVariants(variants)) return [];

  const seen = new Set<string>();
  const colors: ProductColorPreset[] = [];

  for (const v of variants ?? []) {
    const name = v.color?.trim();
    if (!name || name === 'Default' || seen.has(name)) continue;
    seen.add(name);
    const preset = findColorPresetByName(name);
    colors.push(
      preset ?? {
        id: slugifyColorId(name),
        name,
        hex: colorHexForName(name),
      }
    );
  }

  return colors;
}

/** Sizes for PDP — empty when all variants are one-size color-only. */
export function variantsToCatalogSizes(
  variants: VariantLike[] | undefined
): string[] {
  if (!variants?.length) return [];

  const sizes = [
    ...new Set(
      variants
        .map((v) => v.size?.trim())
        .filter((s): s is string => Boolean(s && !isOneSizeLabel(s)))
    ),
  ];

  return sizes;
}

export function buildColorVariantSku(baseSku: string, colorName: string): string {
  const slug = slugifyColorId(colorName).toUpperCase().replace(/-/g, '');
  const prefix = baseSku.replace(/[^A-Za-z0-9-]/g, '').slice(0, 24) || 'SKU';
  return `${prefix}-${slug}`;
}
