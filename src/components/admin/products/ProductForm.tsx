'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useAdminToast } from '@/context/AdminToastContext';

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
}

export function ProductForm({ initial, isEdit }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [form, setForm] = useState<AdminProduct>(initial ?? createEmptyProduct());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const categories = useMemo(() => getCategories(), []);
  const collections = useMemo(() => getCollections(), []);
  const settings = useMemo(() => getSettings(), []);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

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
      updateProduct(initial.id, { ...form, status: 'draft', updatedAt: new Date().toISOString() });
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

  function persist(status: 'draft' | 'published', skipValidation = false) {
    if (!skipValidation && status === 'published' && !validate()) return;
    setSaving(true);
    const payload: AdminProduct = {
      ...form,
      status,
      updatedAt: new Date().toISOString(),
    };
    if (isEdit && initial) {
      updateProduct(initial.id, payload);
      toast('Product updated successfully', 'success');
    } else {
      saveProduct(payload);
      toast('Product created successfully', 'success');
    }
    setSaving(false);
    setDirty(false);
    router.push('/admin/products');
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
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
