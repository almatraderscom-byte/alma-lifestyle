'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { isDatabaseUuid } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import {
  getProducts,
  getCategories,
  updateProduct,
  deleteProduct,
  deleteDesignGroup,
  duplicateProduct,
  getTotalStock,
  type AdminProduct,
} from '@/lib/admin-store';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { groupAdminProductsForList } from '@/lib/family-set-admin';
import { AdminProductsTable } from '@/components/admin/products/AdminProductsTable';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';

type StatusFilter = 'all' | 'published' | 'draft';
export default function AdminProductsPage() {
  const { toast } = useAdminToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [deleteGroup, setDeleteGroup] = useState<{
    id: string;
    name: string;
    count: number;
  } | null>(null);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return list;
  }, [products, search, statusFilter, categoryFilter]);

  const listRows = useMemo(() => groupAdminProductsForList(filtered), [filtered]);
  const totalPages = Math.max(1, Math.ceil(listRows.length / perPage));
  const paginatedRows = listRows.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    console.log('[AdminProducts] Loading, useApi:', shouldUseApi());
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        console.log(
          '[AdminProducts] Loaded',
          p.length,
          'products, sample IDs:',
          p.slice(0, 3).map((x) => x.id)
        );
        const bad = p.filter((x) => shouldUseApi() && !isDatabaseUuid(x.id));
        if (bad.length > 0) {
          setLoadError(
            `${bad.length} product(s) have invalid IDs (localStorage format). Clear site data or fix API connection.`
          );
        }
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  function refresh() {
    setLoading(true);
    setLoadError(null);
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkUpdateStatus(status: 'published' | 'draft') {
    const count = selected.size;
    await Promise.all([...selected].map((id) => updateProduct(id, { status })));
    refresh();
    setSelected(new Set());
    toast(`${count} products updated`, 'success');
  }

  async function bulkDelete() {
    const count = selected.size;
    if (!confirm(`Delete ${count} products?`)) return;
    await Promise.all([...selected].map((id) => deleteProduct(id)));
    refresh();
    setSelected(new Set());
    toast('Products deleted', 'info');
  }

  if (loading && products.length === 0) {
    return <p className="text-neutral-500">Loading products…</p>;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-2">
        <h1 className="text-lg font-semibold text-red-900">Could not load products</h1>
        <p className="text-sm text-red-800">{loadError}</p>
        <p className="text-xs text-red-700">
          Check <a href="/api/v1/debug" className="underline" target="_blank" rel="noreferrer">/api/v1/debug</a> and ensure{' '}
          <code className="bg-red-100 px-1">NEXT_PUBLIC_USE_API=true</code>.
        </p>
        <Button variant="secondary" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="lg:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? 'rounded-lg bg-[#C97D5D] text-white px-4 py-2 text-sm font-medium min-h-10'
                  : 'rounded-lg border border-neutral-300 px-4 py-2 text-sm min-h-10 hover:bg-neutral-50'
              }
            >
              {s === 'all' ? 'All' : s === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-h-10 rounded-lg border border-neutral-300 px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-neutral-100 px-4 py-3 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => bulkUpdateStatus('published')}>
            Publish Selected
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkUpdateStatus('draft')}>
            Unpublish
          </Button>
          <Button size="sm" variant="danger" onClick={bulkDelete}>
            Delete
          </Button>
        </div>
      )}

      <AdminProductsTable
        rows={paginatedRows}
        categories={categories}
        selected={selected}
        onToggleRow={toggleRow}
        onDelete={(id) => {
          if (confirm('Delete product?')) {
            void deleteProduct(id).then(() => {
              refresh();
              toast('Product deleted', 'info');
            });
          }
        }}
        onDuplicate={(id) => {
          void duplicateProduct(id).then(() => {
            refresh();
            toast('Product duplicated as draft', 'success');
          });
        }}
        onTogglePublish={(id, status) => {
          void updateProduct(id, { status }).then(refresh);
        }}
        onDeleteGroup={(group) => setDeleteGroup(group)}
      />

      {deleteGroup && (
        <DeleteConfirmModal
          title={`Delete design group "${deleteGroup.name}"?`}
          description={`This will unlink ${deleteGroup.count} products from this group. The products themselves will remain in the database and can be edited individually.`}
          confirmText="DELETE"
          warningPoints={[
            `The "${deleteGroup.name}" group will be removed`,
            `${deleteGroup.count} products will be unlinked from this group`,
            'Products will appear as individual items, not as a matching set',
            'Products themselves will NOT be deleted',
          ]}
          onConfirm={async () => {
            try {
              const count = await deleteDesignGroup(deleteGroup.id);
              toast(`Unlinked ${count} product(s) from design group`, 'success');
              setDeleteGroup(null);
              refresh();
            } catch (err) {
              toast(err instanceof Error ? err.message : 'Delete failed', 'error');
            }
          }}
          onCancel={() => setDeleteGroup(null)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
