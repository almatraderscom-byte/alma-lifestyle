'use client';

import type { ProductVariant } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';
import {
  PRODUCT_COLOR_PRESETS,
  buildColorVariantSku,
  colorHexForName,
  findColorPresetByName,
  hasColorVariants,
} from '@/lib/product-color-presets';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { cn } from '@/lib/utils';

interface SimpleProductColorVariantsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  variants: ProductVariant[] | undefined;
  baseSku: string;
  onVariantsChange: (variants: ProductVariant[] | undefined, hasVariants: boolean) => void;
}

function makeColorVariant(
  preset: (typeof PRODUCT_COLOR_PRESETS)[number],
  baseSku: string,
  existing?: ProductVariant
): ProductVariant {
  return {
    id: existing?.id ?? uid('var'),
    size: 'One Size',
    color: preset.name,
    colorHex: preset.hex,
    stock: existing?.stock ?? 0,
    sku: existing?.sku ?? buildColorVariantSku(baseSku, preset.name),
  };
}

export function detectSimpleColorVariantsEnabled(
  variants: ProductVariant[] | undefined
): boolean {
  return hasColorVariants(variants);
}

export function SimpleProductColorVariants({
  enabled,
  onEnabledChange,
  variants,
  baseSku,
  onVariantsChange,
}: SimpleProductColorVariantsProps) {
  const rows = variants ?? [];

  function setEnabled(next: boolean) {
    onEnabledChange(next);
    if (next && rows.length === 0) {
      onVariantsChange(
        [makeColorVariant(PRODUCT_COLOR_PRESETS[0], baseSku)],
        true
      );
    }
    if (!next) {
      onVariantsChange(undefined, false);
    }
  }

  function updateRow(id: string, patch: Partial<ProductVariant>) {
    onVariantsChange(
      rows.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      true
    );
  }

  function selectPreset(rowId: string, preset: (typeof PRODUCT_COLOR_PRESETS)[number]) {
    const row = rows.find((v) => v.id === rowId);
    updateRow(rowId, {
      color: preset.name,
      colorHex: preset.hex,
      sku: row?.sku?.includes('-') ? row.sku : buildColorVariantSku(baseSku, preset.name),
    });
  }

  function addPreset(preset: (typeof PRODUCT_COLOR_PRESETS)[number]) {
    if (rows.some((v) => v.color === preset.name)) return;
    onVariantsChange([...rows, makeColorVariant(preset, baseSku)], true);
  }

  function removeRow(id: string) {
    const next = rows.filter((v) => v.id !== id);
    if (next.length === 0) {
      setEnabled(false);
      return;
    }
    onVariantsChange(next, true);
  }

  const usedColors = new Set(rows.map((v) => v.color));

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-2 text-sm font-medium text-neutral-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-1 rounded border-neutral-300"
        />
        <span>
          <span className="block">এই পণ্যের বিভিন্ন রঙ আছে</span>
          <span className="block text-xs font-normal text-neutral-500 mt-0.5">
            Color variants — customers pick a color on the product page
          </span>
        </span>
      </label>

      {enabled && (
        <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
          <div>
            <p className="text-xs font-medium text-neutral-600 mb-2">
              Quick add color
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_COLOR_PRESETS.map((preset) => {
                const used = usedColors.has(preset.name);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.name}
                    disabled={used}
                    onClick={() => addPreset(preset)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform',
                      used
                        ? 'opacity-40 cursor-not-allowed border-neutral-300'
                        : 'border-transparent hover:scale-110 hover:border-neutral-400'
                    )}
                    style={{ backgroundColor: preset.hex }}
                    aria-label={preset.name}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const preset = findColorPresetByName(row.color);
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto] gap-3 items-end border border-neutral-200 rounded-lg p-3 bg-white"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-600">Color</p>
                    <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                      {PRODUCT_COLOR_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          title={p.name}
                          onClick={() => selectPreset(row.id, p)}
                          className={cn(
                            'h-7 w-7 rounded-full border-2',
                            row.color === p.name
                              ? 'border-neutral-900 ring-1 ring-neutral-900'
                              : 'border-neutral-200'
                          )}
                          style={{ backgroundColor: p.hex }}
                          aria-label={p.name}
                        />
                      ))}
                    </div>
                    <Input
                      value={row.color}
                      onChange={(e) => {
                        const name = e.target.value;
                        updateRow(row.id, {
                          color: name,
                          colorHex: colorHexForName(name),
                          sku: buildColorVariantSku(baseSku, name),
                        });
                      }}
                      placeholder="Custom color name"
                    />
                  </div>
                  <Input
                    label="Stock"
                    type="number"
                    min={0}
                    value={row.stock}
                    onChange={(e) => updateRow(row.id, { stock: Number(e.target.value) })}
                  />
                  <Input
                    label="SKU"
                    value={row.sku}
                    onChange={(e) => updateRow(row.id, { sku: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                  >
                    Remove
                  </Button>
                  {preset && (
                    <p className="sm:col-span-4 text-xs text-neutral-500 -mt-1">
                      Selected: {preset.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = PRODUCT_COLOR_PRESETS.find((p) => !usedColors.has(p.name));
              if (next) addPreset(next);
            }}
          >
            + Add another color
          </Button>
        </div>
      )}
    </div>
  );
}
