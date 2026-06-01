'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { newDatabaseId } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import {
  type AdminProduct,
  type ProductVariant,
  createEmptyProduct,
  generateProductSlug,
  getCategories,
  getCollections,
  getSettings,
  saveProduct,
  updateProduct,
  deleteProduct,
  uid,
} from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { Select } from '@/components/admin/ui/Select';
import { ImageUploader } from '@/components/admin/ui/ImageUploader';
import {
  ProductTypeSection,
  type GirlAgeRow,
} from '@/components/admin/products/ProductTypeSection';
import {
  buildGirlTwoPieceVariants,
  GIRL_AGE_GROUPS,
  GIRL_VARIANT_SIZE_BN,
  slugForDesignMember,
  DISPLAY_ORDER_BY_TYPE,
  PRODUCT_TYPE_LABELS_ADMIN,
  type GirlAgeGroup,
} from '@/lib/product-design-types';
import { useAdminToast } from '@/context/AdminToastContext';
import { QuickAddMatchingModal } from '@/components/admin/products/QuickAddMatchingModal';
import { FamilySetForm } from '@/components/admin/products/FamilySetForm';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Custom'];
const COUNTRIES = [
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'TR', label: 'Turkey' },
  { value: 'PK', label: 'Pakistan' },
];

interface ProductFormProps {
  initial?: AdminProduct;
  isEdit?: boolean;
  /** Pre-fill from Quick Add Matching (query params on /admin/products/new) */
  prefill?: {
    designGroupId?: string;
    designGroupName?: string;
    menSlug?: string;
    productType?: AdminProduct['productType'];
  };
}

function designBaseSlugFromMenSlug(menSlug: string): string {
  return menSlug
    .replace(/-men$/, '')
    .replace(/-panjabi-men$/, '-panjabi')
    .replace(/-panjabi$/, '');
}

type CreationMode = 'family_set' | 'single';

const CREATION_MODE_OPTIONS: { value: CreationMode; label: string; hint: string }[] = [
  {
    value: 'family_set',
    label: '👨‍👩‍👧‍👦 Family Matching Set',
    hint: 'Create all selected types in one save',
  },
  { value: 'single', label: '🔹 Single product', hint: 'One product at a time' },
];

export function ProductForm({ initial, isEdit, prefill }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const showCreationMode = !isEdit && !prefill;
  const [creationMode, setCreationMode] = useState<CreationMode>(
    prefill ? 'single' : 'family_set'
  );
  const [form, setForm] = useState<AdminProduct>(initial ?? createEmptyProduct());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [savedMenProduct, setSavedMenProduct] = useState<{
    designGroupId: string;
    designGroupName: string;
    slug: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [collections, setCollections] = useState<Awaited<ReturnType<typeof getCollections>>>([]);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getSettings>> | null>(null);
  const [designGroups, setDesignGroups] = useState<{ id: string; name: string }[]>([]);
  const [girlAgeRows, setGirlAgeRows] = useState<GirlAgeRow[]>(
    GIRL_AGE_GROUPS.map((ageGroup) => ({ ageGroup, stock: 0 }))
  );

  useEffect(() => {
    void Promise.all([getCategories(), getCollections(), getSettings()]).then(
      ([c, col, s]) => {
        setCategories(c);
        setCollections(col);
        setSettings(s);
      }
    );
    void import('@/lib/admin-store').then(({ getProducts }) =>
      getProducts().then((products) => {
        const map = new Map<string, string>();
        for (const p of products) {
          if (p.designGroupId && p.designGroupName) {
            map.set(p.designGroupId, p.designGroupName);
          }
        }
        setDesignGroups([...map.entries()].map(([id, name]) => ({ id, name })));
      })
    );
  }, []);

  useEffect(() => {
    if (initial) setForm(initial);
    if (initial?.productType === 'girl_two_piece' && initial.variants?.length) {
      const sizeToAge = Object.fromEntries(
        Object.entries(GIRL_VARIANT_SIZE_BN).map(([k, v]) => [v, k as GirlAgeGroup])
      ) as Record<string, GirlAgeGroup>;
      setGirlAgeRows(
        GIRL_AGE_GROUPS.map((ageGroup) => {
          const variant = initial.variants?.find(
            (v) => sizeToAge[v.size] === ageGroup || v.size === GIRL_VARIANT_SIZE_BN[ageGroup]
          );
          return { ageGroup, stock: variant?.stock ?? 0 };
        })
      );
    }
  }, [initial]);

  useEffect(() => {
    if (initial || !prefill?.designGroupId) return;
    const type = prefill.productType ?? 'boy_panjabi';
    const baseSlug = prefill.menSlug ? designBaseSlugFromMenSlug(prefill.menSlug) : '';
    setForm((prev) => ({
      ...prev,
      productType: type,
      designGroupId: prefill.designGroupId,
      designGroupName: prefill.designGroupName ?? prev.designGroupName,
      displayOrder: DISPLAY_ORDER_BY_TYPE[type],
      slug: baseSlug ? slugForDesignMember(baseSlug, type) : prev.slug,
      title: prefill.designGroupName
        ? `${prefill.designGroupName} (${PRODUCT_TYPE_LABELS_ADMIN[type]})`
        : prev.title,
      status: 'draft',
    }));
  }, [initial, prefill]);

  function update<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setDirty(true);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !isEdit) {
        next.slug = generateProductSlug(String(value));
        if (!next.sku) next.sku = `SKU-${next.slug.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      }
      return next;
    });
  }

  useEffect(() => {
    if (!dirty || !isEdit || !initial) return;
    const timer = window.setInterval(() => {
      if (!form.title.trim()) return;
      void updateProduct(initial.id, { ...form, status: 'draft', updatedAt: new Date().toISOString() });
      setDraftSavedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => window.clearInterval(timer);
  }, [dirty, form, isEdit, initial]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.priceBdt || form.priceBdt <= 0) next.priceBdt = 'Price is required';
    if (!form.categoryId) next.categoryId = 'Category is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function persist(status: 'draft' | 'published', skipValidation = false) {
    if (!skipValidation && status === 'published' && !validate()) return;
    setSaving(true);
    try {
      let payload: AdminProduct = {
        ...form,
        status,
        updatedAt: new Date().toISOString(),
      };

      if (form.productType === 'girl_two_piece') {
        const skuPrefix = form.sku || `ALM-PNJ-${(form.slug || 'design').replace(/-/g, '').slice(0, 6).toUpperCase()}-G`;
        const stocks = GIRL_AGE_GROUPS.map((ageGroup, i) => ({
          ageGroup,
          stock: girlAgeRows[i]?.stock ?? 0,
        }));
        const variants = buildGirlTwoPieceVariants(skuPrefix, stocks).map((v, i) => ({
          id: form.variants?.[i]?.id ?? (shouldUseApi() ? newDatabaseId() : uid('var')),
          ...v,
        }));
        payload = {
          ...payload,
          sku: skuPrefix,
          ageGroup: undefined,
          hasVariants: true,
          variants,
          stock: undefined,
          displayOrder: DISPLAY_ORDER_BY_TYPE.girl_two_piece,
        };
      }

      if (isEdit && initial) {
        await updateProduct(initial.id, payload);
        toast('Product updated successfully', 'success');
      } else {
        const saved = await saveProduct({
          ...payload,
          id: payload.id || (shouldUseApi() ? newDatabaseId() : uid('prod')),
          createdAt: payload.createdAt || new Date().toISOString(),
        });
        toast('Product created successfully', 'success');
        if (
          status === 'published' &&
          payload.productType === 'men_panjabi' &&
          !prefill?.designGroupId
        ) {
          setSavedMenProduct({
            designGroupId: saved.designGroupId ?? saved.id,
            designGroupName: saved.designGroupName ?? saved.title,
            slug: saved.slug,
          });
          setQuickAddOpen(true);
          setDirty(false);
          setSaving(false);
          return;
        }
      }
      setDirty(false);
      router.push('/admin/products');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  function addVariant() {
    const variant: ProductVariant = {
      id: uid('var'),
      size: 'M',
      color: 'Default',
      stock: 0,
      sku: `${form.sku}-M`,
    };
    update('variants', [...(form.variants ?? []), variant]);
    update('hasVariants', true);
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    update(
      'variants',
      (form.variants ?? []).map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  }

  function removeVariant(id: string) {
    const next = (form.variants ?? []).filter((v) => v.id !== id);
    update('variants', next);
    if (next.length === 0) update('hasVariants', false);
  }

  function toggleCollection(colId: string) {
    const ids = form.collectionIds.includes(colId)
      ? form.collectionIds.filter((id) => id !== colId)
      : [...form.collectionIds, colId];
    update('collectionIds', ids);
  }

  const usd = settings ? (form.priceBdt / settings.usdExchangeRate).toFixed(2) : '—';
  const aed = settings ? (form.priceBdt / settings.aedExchangeRate).toFixed(2) : '—';

  function addTag() {
    const tag = tagInput.trim();
    if (!tag) return;
    const tags = form.tags ?? [];
    if (!tags.includes(tag)) update('tags', [...tags, tag]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    update('tags', (form.tags ?? []).filter((t) => t !== tag));
  }

  if (showCreationMode && creationMode === 'family_set') {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
            What are you creating?
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {CREATION_MODE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 cursor-pointer has-[:checked]:border-[#C97D5D] has-[:checked]:ring-1 has-[:checked]:ring-[#C97D5D]"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="creationMode"
                    checked={creationMode === opt.value}
                    onChange={() => setCreationMode(opt.value)}
                  />
                  <span className="text-sm font-medium text-neutral-900">{opt.label}</span>
                </span>
                <span className="text-xs text-neutral-500 pl-6">{opt.hint}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Or add a single type: Men&apos;s, Boy&apos;s, Women&apos;s, or Girl&apos;s below.
          </p>
          <button
            type="button"
            className="text-sm text-[#C97D5D] hover:underline"
            onClick={() => setCreationMode('single')}
          >
            Switch to single product form →
          </button>
        </section>
        <FamilySetForm />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
        {showCreationMode && (
          <section className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
              What are you creating?
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-3 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:ring-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="creationMode"
                    checked={creationMode === 'family_set'}
                    onChange={() => setCreationMode('family_set')}
                  />
                  👨‍👩‍👧‍👦 Family Matching Set
                </span>
              </label>
              <label className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-3 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:ring-1 sm:col-span-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="creationMode"
                    checked={creationMode === 'single'}
                    onChange={() => setCreationMode('single')}
                  />
                  🔹 Single product (choose type below)
                </span>
              </label>
            </div>
          </section>
        )}
        <ProductTypeSection
          form={form}
          designGroupOptions={designGroups}
          onChange={(next) => {
            setDirty(true);
            setForm(next);
          }}
          girlAgeRows={girlAgeRows}
          onGirlAgeRowsChange={setGirlAgeRows}
        />
        <Card title="Basic Information">
          <div className="space-y-4">
            <Input
              label="Product Title (English / internal)"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              error={errors.title}
            />
            <Input
              label="Bangla Title (customer-facing)"
              value={form.banglaTitle ?? ''}
              onChange={(e) => update('banglaTitle', e.target.value)}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-800">Tags / keywords</p>
              <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form.tags ?? []).includes('bestseller')}
                  onChange={(e) => {
                    const tags = form.tags ?? [];
                    if (e.target.checked) {
                      if (!tags.includes('bestseller')) update('tags', [...tags, 'bestseller']);
                    } else {
                      update(
                        'tags',
                        tags.filter((t) => t !== 'bestseller' && t !== 'জনপ্রিয়')
                      );
                    }
                  }}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-800">
                  জনপ্রিয় (হোমপেজে ফ্লোটিং সংগ্রহে দেখাবে)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(form.tags ?? []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-neutral-500 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
              </div>
            </div>
            <Input
              label="URL Slug"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
            />
            <Textarea
              label="Short Description"
              rows={2}
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
            />
            <Textarea
              label="Description"
              rows={6}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </Card>

        <Card title="Pricing">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Price BDT ৳"
              type="number"
              min={0}
              value={form.priceBdt || ''}
              onChange={(e) => update('priceBdt', Number(e.target.value))}
              error={errors.priceBdt}
            />
            <Input
              label="Original / Compare Price BDT"
              type="number"
              min={0}
              value={form.compareAtPriceBdt ?? ''}
              onChange={(e) =>
                update('compareAtPriceBdt', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <Input
              label="Cost Price BDT"
              type="number"
              min={0}
              value={form.costPriceBdt ?? ''}
              onChange={(e) =>
                update('costPriceBdt', e.target.value ? Number(e.target.value) : undefined)
              }
              hint="For profit calculation only"
            />
            <div className="space-y-2 text-sm text-neutral-600">
              <p>USD (read-only): ${usd}</p>
              <p>AED (read-only): {aed} AED</p>
            </div>
          </div>
        </Card>

        <Card title="Inventory & Variants">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 mb-4">
            <input
              type="checkbox"
              checked={form.hasVariants}
              onChange={(e) => {
                update('hasVariants', e.target.checked);
                if (e.target.checked && !form.variants?.length) addVariant();
              }}
              className="rounded border-neutral-300"
            />
            This product has variants (size/color)
          </label>
          {!form.hasVariants ? (
            <Input
              label="Stock Quantity"
              type="number"
              min={0}
              value={form.stock ?? 0}
              onChange={(e) => update('stock', Number(e.target.value))}
            />
          ) : (
            <div className="space-y-3">
              {(form.variants ?? []).map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end border border-neutral-200 rounded-lg p-3"
                >
                  <Select
                    label="Size"
                    value={v.size}
                    onChange={(e) => updateVariant(v.id, { size: e.target.value })}
                    options={SIZES.map((s) => ({ value: s, label: s }))}
                  />
                  <Input
                    label="Color"
                    value={v.color}
                    onChange={(e) => updateVariant(v.id, { color: e.target.value })}
                  />
                  <Input
                    label="Stock"
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value) })}
                  />
                  <Input
                    label="SKU"
                    value={v.sku}
                    onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(v.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
          )}
        </Card>

        <Card title="Product Details">
          <div className="space-y-4">
            <Input
              label="Fabric / Material"
              value={form.fabric ?? ''}
              onChange={(e) => update('fabric', e.target.value)}
            />
            <Textarea
              label="Care Instructions"
              rows={3}
              value={form.careInstructions ?? ''}
              onChange={(e) => update('careInstructions', e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                value={form.weightKg ?? ''}
                onChange={(e) =>
                  update('weightKg', e.target.value ? Number(e.target.value) : undefined)
                }
              />
              <Select
                label="Origin Country"
                value={form.originCountry ?? 'BD'}
                onChange={(e) => update('originCountry', e.target.value)}
                options={COUNTRIES}
              />
            </div>
          </div>
        </Card>

        <Card
          title="SEO"
          action={
            <button type="button" className="text-sm text-[#C97D5D]" onClick={() => setSeoOpen(!seoOpen)}>
              {seoOpen ? 'Collapse' : 'Expand'}
            </button>
          }
        >
          {seoOpen && (
            <div className="space-y-4">
              <Input
                label="SEO Title"
                maxLength={60}
                value={form.seoTitle ?? ''}
                onChange={(e) => update('seoTitle', e.target.value)}
                hint={`${(form.seoTitle ?? '').length}/60`}
              />
              <Textarea
                label="SEO Description"
                maxLength={160}
                rows={3}
                value={form.seoDescription ?? ''}
                onChange={(e) => update('seoDescription', e.target.value)}
                hint={`${(form.seoDescription ?? '').length}/160`}
              />
              <Input
                label="SEO Keywords"
                value={form.seoKeywords ?? ''}
                onChange={(e) => update('seoKeywords', e.target.value)}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="xl:col-span-4 space-y-6">
        <Card title="Publish">
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value as AdminProduct['status'])}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />
          <p className="text-xs text-neutral-500 mt-2">Use the action bar at the bottom to save or publish.</p>
          {isEdit && initial && (
            <Button
              variant="danger"
              className="w-full mt-4"
              onClick={() => {
                if (confirm('Delete this product permanently?')) {
                  deleteProduct(initial.id);
                  toast('Product deleted', 'info');
                  router.push('/admin/products');
                }
              }}
            >
              Delete Product
            </Button>
          )}
        </Card>

        <Card title="Category">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            error={errors.categoryId}
            options={[
              { value: '', label: 'Select category' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Link href="/admin/products/categories" className="text-sm text-[#C97D5D] mt-2 inline-block">
            + Add new category
          </Link>
        </Card>

        <Card title="Images">
          <ImageUploader images={form.images} onChange={(images) => update('images', images)} />
        </Card>

        <Card title="Collections">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collections.map((col) => (
              <label key={col.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.collectionIds.includes(col.id)}
                  onChange={() => toggleCollection(col.id)}
                  className="rounded border-neutral-300"
                />
                {col.name}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 py-3 lg:pl-[calc(15rem+1rem)]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            {draftSavedAt ? `Draft saved at ${draftSavedAt}` : dirty ? 'Unsaved changes' : 'All changes saved'}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products">
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  if (dirty && !confirm('Leave without saving?')) e.preventDefault();
                }}
              >
                Cancel
              </Button>
            </Link>
            <Button variant="secondary" loading={saving} onClick={() => { persist('draft', true); setDirty(false); }}>
              Save Draft
            </Button>
            <Button loading={saving} onClick={() => { persist('published'); setDirty(false); }}>
              Publish
            </Button>
          </div>
        </div>
      </div>
      <div className="h-20" aria-hidden />

      {quickAddOpen && savedMenProduct && (
        <QuickAddMatchingModal
          designGroupId={savedMenProduct.designGroupId}
          designGroupName={savedMenProduct.designGroupName}
          menSlug={savedMenProduct.slug}
          onDismiss={() => {
            setQuickAddOpen(false);
            router.push('/admin/products');
          }}
        />
      )}
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
