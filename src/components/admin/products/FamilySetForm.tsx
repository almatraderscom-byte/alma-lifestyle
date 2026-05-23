'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createDefaultFamilySetState,
  buildFamilySetProducts,
  validateFamilySetState,
  designSlugFromName,
  skuPrefixForType,
  FAMILY_MEMBER_TYPES,
  FAMILY_MEMBER_LABELS,
  FAMILY_CARD_BG,
  FAMILY_IMAGE_BORDER,
  FAMILY_IMAGE_SLOT_LABELS,
  getActiveFamilyImageSlots,
  type FamilyImageSlotKey,
  type FamilyMemberType,
  type FamilySetFormState,
} from '@/lib/family-set-admin';
import { FamilyImageSlot } from '@/components/admin/products/FamilyImageSlot';
import {
  GIRL_AGE_GROUPS,
  GIRL_AGE_LABELS_BN,
  SIZE_PRESETS,
} from '@/lib/product-design-types';
import { getCategories, saveProduct } from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { useAdminToast } from '@/context/AdminToastContext';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'TR', label: 'Turkey' },
  { value: 'PK', label: 'Pakistan' },
];

const MEMBER_EMOJI: Record<FamilyMemberType, string> = {
  men_panjabi: '👨',
  boy_panjabi: '👦',
  women_three_piece: '👩',
  girl_two_piece: '👧',
};

type ProgressStep = { label: string; status: 'pending' | 'loading' | 'done' | 'error' };

export function FamilySetForm() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [state, setState] = useState<FamilySetFormState>(createDefaultFamilySetState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<ProgressStep[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);

  const designSlug = useMemo(
    () => (state.designName.trim() ? designSlugFromName(state.designName) : ''),
    [state.designName]
  );

  useEffect(() => {
    void getCategories().then((cats) => {
      setCategories(cats);
      const panjabi = cats.find((c) => c.slug === 'panjabi');
      if (panjabi) {
        setState((s) => (s.categoryId ? s : { ...s, categoryId: panjabi.id }));
      }
    });
  }, []);

  function patch(partial: Partial<FamilySetFormState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  function setMemberImage(slot: FamilyImageSlotKey, image: import('@/lib/admin-store').ProductImage | null) {
    setState((s) => ({
      ...s,
      memberImages: { ...s.memberImages, [slot]: image },
    }));
  }

  const imageSlots = useMemo(() => getActiveFamilyImageSlots(state), [state.members]);

  function patchMember(type: FamilyMemberType, partial: Partial<FamilySetFormState['members'][FamilyMemberType]>) {
    setState((s) => ({
      ...s,
      members: {
        ...s.members,
        [type]: { ...s.members[type], ...partial },
      },
    }));
  }

  function toggleExpanded(type: FamilyMemberType) {
    setState((s) => ({
      ...s,
      expanded: { ...s.expanded, [type]: !s.expanded[type] },
    }));
  }

  async function handleSaveFamilySet() {
    const nextErrors = validateFamilySetState(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { products } = buildFamilySetProducts({ state });
    const ordered = [...products].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );

    const steps: ProgressStep[] = ordered.map((p) => ({
      label: p.title,
      status: 'pending' as const,
    }));
    setProgress(steps);
    setSaving(true);

    let rootId: string | undefined;
    let created = 0;

    try {
      for (let i = 0; i < ordered.length; i++) {
        setProgress((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'loading' } : s))
        );
        const saved = await saveProduct({
          ...ordered[i],
          designGroupId: rootId,
        });
        if (!rootId) {
          rootId = saved.designGroupId ?? saved.id;
        }
        created++;
        setProgress((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s))
        );
      }
      toast(`Family Set created! ${created} products added.`, 'success');
      router.push('/admin/products');
    } catch (err) {
      setProgress((prev) =>
        prev.map((s, idx) =>
          idx === prev.findIndex((x) => x.status === 'loading')
            ? { ...s, status: 'error' }
            : s
        )
      );
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Design Information</h2>
        <p className="text-sm text-neutral-500">Shared across all family members in this set.</p>
        <Input
          label="Design Name *"
          value={state.designName}
          onChange={(e) => patch({ designName: e.target.value })}
          placeholder='e.g. রয়্যাল নেভি'
          error={errors.designName}
        />
        {designSlug && (
          <p className="text-xs text-neutral-500">
            URL base: <code className="bg-neutral-100 px-1">{designSlug}</code>
          </p>
        )}
        <Textarea
          label="Description (Bangla) *"
          rows={4}
          value={state.description}
          onChange={(e) => patch({ description: e.target.value })}
          error={errors.description}
        />
        <Textarea
          label="Short Description"
          rows={2}
          value={state.shortDescription}
          onChange={(e) => patch({ shortDescription: e.target.value })}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Fabric / Material"
            value={state.fabric}
            onChange={(e) => patch({ fabric: e.target.value })}
          />
          <Select
            label="Origin Country"
            value={state.originCountry}
            onChange={(e) => patch({ originCountry: e.target.value })}
            options={COUNTRIES}
          />
        </div>
        <Textarea
          label="Care Instructions"
          rows={2}
          value={state.careInstructions}
          onChange={(e) => patch({ careInstructions: e.target.value })}
        />
        <input type="hidden" value={state.categoryId} readOnly />
        <p className="text-sm text-neutral-600">
          Category: <strong>Panjabi</strong> (auto-selected)
        </p>
        {errors.categoryId && (
          <p className="text-sm text-red-600">{errors.categoryId}</p>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Select Family Members</h2>
        {errors.members && (
          <p className="text-sm text-red-600">{errors.members}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {FAMILY_MEMBER_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={state.members[type].enabled}
                onChange={(e) => patchMember(type, { enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">
                {MEMBER_EMOJI[type]} {FAMILY_MEMBER_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </section>

      {imageSlots.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Product photos</h2>
          <p className="text-sm text-neutral-500">
            One slot per selected family member. Optional group photo is shown first in the customer
            gallery on every product in this set.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {imageSlots.map((slot) => (
              <FamilyImageSlot
                key={slot}
                label={FAMILY_IMAGE_SLOT_LABELS[slot]}
                borderClass={FAMILY_IMAGE_BORDER[slot]}
                value={state.memberImages[slot] ?? null}
                onChange={(img) => setMemberImage(slot, img)}
                uploadFolder={`family-sets/${designSlug || 'draft'}`}
              />
            ))}
          </div>
        </section>
      )}

      {FAMILY_MEMBER_TYPES.map((type) => {
        if (!state.members[type].enabled) return null;
        const cfg = state.members[type];
        const expanded = state.expanded[type];
        const sku = designSlug ? skuPrefixForType(designSlug, type) : '—';

        return (
          <section
            key={type}
            className={cn(
              'rounded-xl border p-5 shadow-sm space-y-4',
              FAMILY_CARD_BG[type]
            )}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleExpanded(type)}
            >
              <h3 className="text-base font-semibold text-neutral-900">
                {MEMBER_EMOJI[type]} {FAMILY_MEMBER_LABELS[type]}
              </h3>
              <span className="text-neutral-500">{expanded ? '▼' : '▶'}</span>
            </button>

            {expanded && (
              <>
                {type === 'girl_two_piece' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                      Creates 3 products (one per age group), each with its own price.
                    </p>
                    {GIRL_AGE_GROUPS.map((age, i) => (
                      <div
                        key={age}
                        className="rounded-lg border border-neutral-200/80 bg-white/80 p-4 grid sm:grid-cols-2 gap-3"
                      >
                        <p className="sm:col-span-2 text-sm font-medium">
                          {GIRL_AGE_LABELS_BN[age]}
                        </p>
                        <Input
                          label="Price BDT ৳ *"
                          type="number"
                          min={0}
                          value={cfg.girlAges?.[i]?.priceBdt || ''}
                          onChange={(e) => {
                            const girlAges = [...(cfg.girlAges ?? [])];
                            girlAges[i] = {
                              ...girlAges[i],
                              ageGroup: age,
                              priceBdt: Number(e.target.value),
                              stock: girlAges[i]?.stock ?? 10,
                            };
                            patchMember(type, { girlAges });
                          }}
                          error={errors[`girl_${age}`]}
                        />
                        <Input
                          label="Stock"
                          type="number"
                          min={0}
                          value={cfg.girlAges?.[i]?.stock ?? 10}
                          onChange={(e) => {
                            const girlAges = [...(cfg.girlAges ?? [])];
                            girlAges[i] = {
                              ...girlAges[i],
                              ageGroup: age,
                              priceBdt: girlAges[i]?.priceBdt ?? 0,
                              stock: Number(e.target.value),
                            };
                            patchMember(type, { girlAges });
                          }}
                        />
                        {designSlug && (
                          <p className="sm:col-span-2 text-xs text-neutral-500">
                            SKU: {skuPrefixForType(designSlug, type, age)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Price BDT ৳ *"
                        type="number"
                        min={0}
                        value={cfg.priceBdt || ''}
                        onChange={(e) =>
                          patchMember(type, { priceBdt: Number(e.target.value) })
                        }
                        error={errors[type]}
                      />
                      <Input
                        label="Default stock per size"
                        type="number"
                        min={0}
                        value={cfg.stockPerSize}
                        onChange={(e) =>
                          patchMember(type, { stockPerSize: Number(e.target.value) })
                        }
                      />
                    </div>
                    {type === 'women_three_piece' && (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={cfg.womenFreeSize ?? false}
                          onChange={(e) =>
                            patchMember(type, { womenFreeSize: e.target.checked })
                          }
                          className="rounded"
                        />
                        Free Size only (single variant)
                      </label>
                    )}
                    <p className="text-xs text-neutral-600">
                      Sizes:{' '}
                      {type === 'women_three_piece' && cfg.womenFreeSize
                        ? 'Free Size'
                        : SIZE_PRESETS[type].join(', ')}
                    </p>
                    <p className="text-xs text-neutral-500">
                      SKU prefix: <code className="bg-white/60 px-1">{sku}</code>
                    </p>
                  </>
                )}
              </>
            )}
          </section>
        );
      })}

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Publish</h2>
        <Select
          label="Status (all products in set)"
          value={state.status}
          onChange={(e) =>
            patch({ status: e.target.value as FamilySetFormState['status'] })
          }
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
      </section>

      {progress.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Creating products…</h3>
          <ul className="space-y-1 text-sm">
            {progress.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>
                  {step.status === 'done' && '✓'}
                  {step.status === 'loading' && '…'}
                  {step.status === 'error' && '✗'}
                  {step.status === 'pending' && '○'}
                </span>
                <span
                  className={
                    step.status === 'done'
                      ? 'text-green-700'
                      : step.status === 'error'
                        ? 'text-red-600'
                        : 'text-neutral-700'
                  }
                >
                  {step.status === 'loading' ? 'Creating' : 'Created'} {step.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 py-3 lg:pl-[calc(15rem+1rem)]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-end gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button
            loading={saving}
            className="min-h-12 px-8 text-base"
            onClick={() => void handleSaveFamilySet()}
          >
            Save Family Set
          </Button>
        </div>
      </div>
    </div>
  );
}
