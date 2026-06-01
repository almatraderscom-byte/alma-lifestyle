'use client';

import { useEffect, useState } from 'react';
import { newDatabaseId } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import {
  getCategories,
  saveCategory,
  updateCategory,
  deleteCategory,
  uid,
  type AdminCategory,
} from '@/lib/admin-store';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';
import { AdminCustomerLink } from '@/components/admin/AdminCustomerLink';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function AdminCategoriesPage() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  async function refresh() {
    setItems(await getCategories());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  function startEdit(cat: AdminCategory) {
    setEditing({ ...cat });
  }

  function startNew() {
    setEditing({
      id: shouldUseApi() ? newDatabaseId() : uid('cat'),
      name: '',
      slug: '',
      displayOrder: items.length,
      active: true,
      showInMenu: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.name.trim()) return;
    setSaving(true);
    try {
      const slug = editing.slug.trim() || slugify(editing.name);
      const payload: AdminCategory = {
        ...editing,
        name: editing.name.trim(),
        slug,
        displayOrder: editing.displayOrder ?? 0,
        active: editing.active ?? true,
        showInMenu: editing.showInMenu ?? true,
        updatedAt: new Date().toISOString(),
      };
      const isNew = !items.some((c) => c.id === payload.id);
      if (isNew) {
        await saveCategory(payload);
      } else {
        await updateCategory(payload.id, payload);
      }
      await refresh();
      setEditing(null);
      setName('');
      toast('Category saved', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const slug = slugify(name);
      await saveCategory({
        id: shouldUseApi() ? newDatabaseId() : uid('cat'),
        name: name.trim(),
        slug,
        displayOrder: items.length,
        active: true,
        showInMenu: true,
        createdAt: now,
        updatedAt: now,
      });
      await refresh();
      setName('');
      toast('Category added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading categories…</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Categories with &quot;Show in navigation menu&quot; appear in the storefront header (up to 4,
          by display order).
        </p>
      </div>

      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          placeholder="Quick add category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={saving}>
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={startNew}>
          Full form
        </Button>
      </form>

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#C97D5D]/40 bg-white p-4 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-neutral-900">
            {items.some((c) => c.id === editing.id) ? 'Edit category' : 'New category'}
          </h2>
          <Input
            label="Name"
            value={editing.name}
            onChange={(e) =>
              setEditing((c) =>
                c ? { ...c, name: e.target.value, slug: c.slug || slugify(e.target.value) } : c
              )
            }
            required
          />
          <Input
            label="Slug"
            value={editing.slug}
            onChange={(e) => setEditing((c) => (c ? { ...c, slug: e.target.value } : c))}
            hint="Used in URL: /products?category=slug"
          />
          <Input
            label="Menu display order"
            type="number"
            value={String(editing.displayOrder ?? 0)}
            onChange={(e) =>
              setEditing((c) =>
                c ? { ...c, displayOrder: parseInt(e.target.value, 10) || 0 } : c
              )
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.showInMenu !== false}
              onChange={(e) =>
                setEditing((c) => (c ? { ...c, showInMenu: e.target.checked } : c))
              }
              className="h-4 w-4 accent-[#C97D5D]"
            />
            Show in navigation menu
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.active !== false}
              onChange={(e) =>
                setEditing((c) => (c ? { ...c, active: e.target.checked } : c))
              }
              className="h-4 w-4 accent-[#C97D5D]"
            />
            Active (visible on storefront)
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              Save
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ul className="rounded-xl border border-neutral-200 bg-white divide-y">
        {[...items]
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((cat) => (
            <li key={cat.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-neutral-500">
                  {cat.slug} · order {cat.displayOrder ?? 0}
                  {cat.showInMenu === false ? ' · hidden from menu' : ' · in menu'}
                  {cat.active === false ? ' · inactive' : ''}
                </p>
                <AdminCustomerLink
                  href={`/products?category=${cat.slug}`}
                  label="View on customer site →"
                  className="text-xs font-medium text-[#C97D5D] hover:underline mt-1 inline-block"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Deactivate this category?')) {
                      await updateCategory(cat.id, { active: false, showInMenu: false });
                      await refresh();
                      toast('Category deactivated', 'info');
                    }
                  }}
                >
                  Hide
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setDeleteTarget(cat)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
      </ul>

      {deleteTarget && (
        <DeleteConfirmModal
          title={`Delete category "${deleteTarget.name}"?`}
          description="This permanently removes the category. It only works if no products are assigned to this category."
          confirmText="DELETE"
          warningPoints={['Category record removed from database']}
          onConfirm={async () => {
            try {
              await deleteCategory(deleteTarget.id);
              toast('Category deleted', 'success');
              setDeleteTarget(null);
              await refresh();
            } catch (err) {
              toast(err instanceof Error ? err.message : 'Delete failed', 'error');
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
