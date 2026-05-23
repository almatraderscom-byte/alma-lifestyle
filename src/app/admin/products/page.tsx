'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getProducts,
  getCategories,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  getTotalStock,
  type AdminProduct,
} from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Table, type TableColumn } from '@/components/admin/ui/Table';
import { useAdminToast } from '@/context/AdminToastContext';

type StatusFilter = 'all' | 'published' | 'draft';
type SortKey = 'date' | 'title' | 'price' | 'stock';

export default function AdminProductsPage() {
  const { toast } = useAdminToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const perPage = 10;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'title' ? 'asc' : 'desc');
    }
  }

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
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      if (sortKey === 'price') cmp = a.priceBdt - b.priceBdt;
      if (sortKey === 'stock') cmp = getTotalStock(a) - getTotalStock(b);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [products, search, statusFilter, categoryFilter, sortKey, sortDir]);

  function stockIndicator(stock: number) {
    if (stock > 10) return 'bg-green-500';
    if (stock > 0) return 'bg-amber-400';
    return 'bg-red-500';
  }

  function SortHeader({ label, col }: { label: string; col: SortKey }) {
    return (
      <button type="button" className="font-medium hover:text-[#C97D5D] flex items-center gap-1" onClick={() => toggleSort(col)}>
        {label}
        {sortKey === col && <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  function refresh() {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
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

  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((p) => p.id)));
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

  const columns: TableColumn<AdminProduct>[] = [
    {
      key: 'thumb',
      header: '',
      className: 'w-14',
      render: (p) =>
        p.images[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0].url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded bg-neutral-200 shrink-0" />
        ),
    },
    {
      key: 'title',
      header: <SortHeader label="Title" col="title" />,
      render: (p) => (
        <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-[#C97D5D] hover:underline">
          {p.title}
        </Link>
      ),
    },
    { key: 'sku', header: 'SKU', render: (p) => <span className="text-neutral-500">{p.sku}</span> },
    {
      key: 'category',
      header: 'Category',
      render: (p) => categories.find((c) => c.id === p.categoryId)?.name ?? '—',
    },
    {
      key: 'price',
      header: <SortHeader label="Price" col="price" />,
      render: (p) => <span>৳ {p.priceBdt.toLocaleString('en-US')}</span>,
    },
    {
      key: 'stock',
      header: <SortHeader label="Stock" col="stock" />,
      render: (p) => {
        const stock = getTotalStock(p);
        return (
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${stockIndicator(stock)}`} />
            {stock}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={
            p.status === 'published'
              ? 'inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'
              : 'inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600'
          }
        >
          {p.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/products/${p.id}/edit`} className="p-2 hover:bg-neutral-100 rounded" title="Edit">
            ✎
          </Link>
          {p.status === 'published' && (
            <a
              href={`/products/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-neutral-100 rounded text-xs"
              title="View on site"
            >
              ↗
            </a>
          )}
          <button
            type="button"
            className="p-2 hover:bg-neutral-100 rounded"
            title="Duplicate"
            onClick={() => {
              void duplicateProduct(p.id).then(() => {
                refresh();
                toast('Product duplicated as draft', 'success');
              });
            }}
          >
            ⧉
          </button>
          <button
            type="button"
            className="p-2 hover:bg-neutral-100 rounded"
            title="Toggle publish"
            onClick={() => {
              void updateProduct(p.id, {
                status: p.status === 'published' ? 'draft' : 'published',
              }).then(refresh);
            }}
          >
            👁
          </button>
          <button
            type="button"
            className="p-2 hover:bg-red-50 text-red-600 rounded"
            title="Delete"
            onClick={() => {
              if (confirm('Delete product?')) {
                void deleteProduct(p.id).then(() => {
                  refresh();
                  toast('Product deleted', 'info');
                });
              }
            }}
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  if (loading && products.length === 0) {
    return <p className="text-neutral-500">Loading products…</p>;
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

      <Table
        columns={columns}
        data={paginated}
        rowKey={(p) => p.id}
        emptyMessage="No products yet. Add your first product."
        selectable
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        allSelected={paginated.length > 0 && selected.size === paginated.length}
      />

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
