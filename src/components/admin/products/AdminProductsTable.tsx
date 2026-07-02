'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminProduct } from '@/lib/admin-store';
import { getTotalStock } from '@/lib/admin-store';
import type { AdminProductGroupRow } from '@/lib/family-set-admin';
import { PRODUCT_TYPE_BADGE_BN, type ProductType } from '@/lib/product-design-types';
import { cn } from '@/lib/utils';

interface AdminProductsTableProps {
  rows: AdminProductGroupRow[];
  categories: { id: string; name: string }[];
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteGroup?: (group: { id: string; name: string; count: number }) => void;
  onDuplicate: (id: string) => void;
  onTogglePublish: (id: string, status: AdminProduct['status']) => void;
}

function stockIndicator(stock: number) {
  if (stock > 10) return 'bg-green-500';
  if (stock > 0) return 'bg-amber-400';
  return 'bg-red-500';
}

function typeBadge(type: ProductType | undefined) {
  if (!type || type === 'simple') return null;
  const label = PRODUCT_TYPE_BADGE_BN[type as Exclude<ProductType, 'simple'>];
  if (!label) return null;
  return (
    <span className="inline-flex rounded-full bg-neutral-800 text-white text-[10px] px-2 py-0.5 font-medium">
      {label}
    </span>
  );
}

export function AdminProductsTable({
  rows,
  categories,
  selected,
  onToggleRow,
  onDelete,
  onDeleteGroup,
  onDuplicate,
  onTogglePublish,
}: AdminProductsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderProductRow(p: AdminProduct, nested = false) {
    const stock = getTotalStock(p);
    const cat = categories.find((c) => c.id === p.categoryId)?.name ?? '—';

    return (
      <tr
        key={p.id}
        className={cn(
          'border-b border-neutral-100 hover:bg-neutral-50/80',
          nested && 'bg-neutral-50/50'
        )}
      >
        <td className="py-3 px-2 w-10">
          <input
            type="checkbox"
            checked={selected.has(p.id)}
            onChange={() => onToggleRow(p.id)}
            className="rounded"
          />
        </td>
        <td className="py-3 px-2 w-14">
          {p.images[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-neutral-200" />
          )}
        </td>
        <td className={cn('py-3 px-2', nested && 'pl-8')}>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/products/${p.id}/edit`}
              className="font-medium text-[var(--ob-violet)] hover:underline"
            >
              {p.title}
            </Link>
            {typeBadge(p.productType)}
            {p.designGroupId && !nested && (
              <span className="text-[10px] rounded-full bg-[var(--ob-violet)]/15 text-[var(--ob-violet)] px-2 py-0.5 font-medium">
                Matching set
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-2 text-neutral-500 text-sm">{p.sku}</td>
        <td className="py-3 px-2 text-sm">{cat}</td>
        <td className="py-3 px-2 text-sm">৳ {p.priceBdt.toLocaleString('en-US')}</td>
        <td className="py-3 px-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${stockIndicator(stock)}`} />
            {stock}
          </span>
        </td>
        <td className="py-3 px-2">
          <span
            className={
              p.status === 'published'
                ? 'inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'
                : 'inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600'
            }
          >
            {p.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>
        <td className="py-3 px-2">
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
                title="View"
              >
                ↗
              </a>
            )}
            <button
              type="button"
              className="p-2 hover:bg-neutral-100 rounded"
              title="Duplicate"
              onClick={() => onDuplicate(p.id)}
            >
              ⧉
            </button>
            <button
              type="button"
              className="p-2 hover:bg-neutral-100 rounded"
              title="Toggle publish"
              onClick={() =>
                onTogglePublish(p.id, p.status === 'published' ? 'draft' : 'published')
              }
            >
              👁
            </button>
            <button
              type="button"
              className="p-2 hover:bg-red-50 text-red-600 rounded"
              title="Delete"
              onClick={() => onDelete(p.id)}
            >
              🗑
            </button>
          </div>
        </td>
      </tr>
    );
  }

  function renderGroupRow(row: Extract<AdminProductGroupRow, { kind: 'group' }>) {
    const expanded = expandedGroups.has(row.designGroupId);
    const prices = row.products.map((p) => p.priceBdt);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const types = new Set(
      row.products.map((p) => p.productType).filter((t) => t && t !== 'simple')
    );
    const men = row.products.find((p) => p.productType === 'men_panjabi');

    return (
      <>
        <tr
          key={`group-${row.designGroupId}`}
          className="border-b border-neutral-200 bg-[#faf8f6] hover:bg-[#f5f0eb]"
        >
          <td className="py-3 px-2" colSpan={9}>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => toggleGroup(row.designGroupId)}
                className="text-neutral-600 font-mono text-sm w-6"
                aria-expanded={expanded}
              >
                {expanded ? '▼' : '▶'}
              </button>
              <span className="inline-flex rounded-full bg-[var(--ob-violet)] text-white text-xs px-2.5 py-0.5 font-semibold">
                Design Group
              </span>
              <span className="font-semibold text-neutral-900">{row.designName}</span>
              <span className="text-sm text-neutral-600">
                {types.size} types · {row.products.length} products
              </span>
              <span className="text-sm text-neutral-700">
                ৳ {min.toLocaleString('en-US')}
                {max !== min && ` — ৳ ${max.toLocaleString('en-US')}`}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {men && (
                  <Link
                    href={`/admin/products/${men.id}/edit`}
                    className="text-sm text-[var(--ob-violet)] hover:underline"
                  >
                    Edit men&apos;s (primary) →
                  </Link>
                )}
                {onDeleteGroup && (
                  <button
                    type="button"
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Delete design group"
                    onClick={() =>
                      onDeleteGroup({
                        id: row.designGroupId,
                        name: row.designName,
                        count: row.products.length,
                      })
                    }
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
        {expanded && row.products.map((p) => renderProductRow(p, true))}
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-center py-12 text-neutral-500 rounded-xl border border-dashed">
        No products yet. Add your first product.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
          <tr>
            <th className="py-3 px-2 w-10" />
            <th className="py-3 px-2 w-14" />
            <th className="py-3 px-2 font-medium">Title</th>
            <th className="py-3 px-2 font-medium">SKU</th>
            <th className="py-3 px-2 font-medium">Category</th>
            <th className="py-3 px-2 font-medium">Price</th>
            <th className="py-3 px-2 font-medium">Stock</th>
            <th className="py-3 px-2 font-medium">Status</th>
            <th className="py-3 px-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.kind === 'group' ? renderGroupRow(row) : renderProductRow(row.product)
          )}
        </tbody>
      </table>
    </div>
  );
}
