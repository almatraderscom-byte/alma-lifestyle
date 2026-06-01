'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  archiveOrder,
  bulkOrderAction,
  cancelOrder,
  deleteOrderPermanently,
  getOrders,
  restoreOrder,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from '@/lib/admin-store';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { Table, type TableColumn } from '@/components/admin/ui/Table';
import { Select } from '@/components/admin/ui/Select';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/context/AdminToastContext';

type ConfirmTarget = { type: 'single'; id: string } | { type: 'bulk' } | null;

export default function AdminOrdersPage() {
  const { toast } = useAdminToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmTarget>(null);
  const [archiveWarning, setArchiveWarning] = useState<AdminOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders(
        showArchived ? { archivedOnly: true } : { includeArchived: false }
      );
      setOrders(data);
      setSelectedIds([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [showArchived, toast]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? orders.map((o) => o.id) : []);
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((orderId) => orderId !== id)
    );
  }

  async function handleCancel(id: string) {
    try {
      await cancelOrder(id);
      toast('Order cancelled', 'success');
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancel failed', 'error');
    }
  }

  async function handleArchive(order: AdminOrder, skipWarning = false) {
    if (
      !skipWarning &&
      (order.status === 'delivered' || order.status === 'shipped')
    ) {
      setArchiveWarning(order);
      return;
    }
    setArchiveWarning(null);
    try {
      await archiveOrder(order.id);
      toast('Order archived', 'success');
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Archive failed', 'error');
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreOrder(id);
      toast('Order restored', 'success');
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Restore failed', 'error');
    }
  }

  async function handlePermanentDelete() {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'bulk') {
        await bulkOrderAction(selectedIds, 'delete');
        toast(`Deleted ${selectedIds.length} order(s)`, 'success');
      } else {
        await deleteOrderPermanently(confirmDelete.id);
        toast('Order permanently deleted', 'success');
      }
      setConfirmDelete(null);
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  async function handleBulkAction(action: 'archive' | 'cancel' | 'delete') {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      setConfirmDelete({ type: 'bulk' });
      return;
    }
    try {
      await bulkOrderAction(selectedIds, action);
      toast(
        action === 'archive'
          ? `Archived ${selectedIds.length} order(s)`
          : `Cancelled ${selectedIds.length} order(s)`,
        'success'
      );
      await loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Bulk action failed', 'error');
    }
  }

  const columns: TableColumn<AdminOrder>[] = useMemo(
    () => [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            aria-label="Select all orders"
          />
        ),
        render: (o) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(o.id)}
            onChange={(e) => toggleSelect(o.id, e.target.checked)}
            aria-label={`Select order ${o.orderNumber}`}
          />
        ),
      },
      { key: 'num', header: 'Order #', render: (o) => o.orderNumber },
      { key: 'name', header: 'Customer', render: (o) => o.customerName },
      { key: 'phone', header: 'Phone', render: (o) => o.customerPhone },
      { key: 'city', header: 'City', render: (o) => o.city },
      { key: 'total', header: 'Total', render: (o) => `৳ ${o.totalBdt.toLocaleString('en-US')}` },
      {
        key: 'status',
        header: 'Status',
        render: (o) =>
          o.archivedAt ? (
            <span className="text-xs text-neutral-500">Archived</span>
          ) : (
            <Select
              value={o.status}
              onChange={(e) => {
                void updateOrderStatus(o.id, e.target.value as OrderStatus)
                  .then(() => loadOrders())
                  .catch((err) =>
                    toast(err instanceof Error ? err.message : 'Update failed', 'error')
                  );
              }}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          ),
      },
      {
        key: 'date',
        header: 'Date',
        render: (o) => new Date(o.createdAt).toLocaleDateString('en-GB'),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (o) => (
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {!o.archivedAt && (
              <>
                {o.status !== 'cancelled' && o.status !== 'delivered' && (
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-amber-700 hover:bg-amber-50"
                    title="Cancel order"
                    onClick={() => void handleCancel(o.id)}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                  title="Archive (soft delete)"
                  onClick={() => void handleArchive(o)}
                >
                  Archive
                </button>
              </>
            )}
            {o.archivedAt && (
              <>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-emerald-700 hover:bg-emerald-50"
                  title="Restore from archive"
                  onClick={() => void handleRestore(o.id)}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                  title="Permanently delete"
                  onClick={() => setConfirmDelete({ type: 'single', id: o.id })}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [allSelected, selectedIds, loadOrders, toast]
  );

  if (loading && orders.length === 0) {
    return <p className="text-neutral-500">Loading orders…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Orders</h1>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? 'Showing archived' : 'Showing active'}
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} order(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            {!showArchived && (
              <>
                <Button type="button" variant="secondary" onClick={() => void handleBulkAction('cancel')}>
                  Cancel selected
                </Button>
                <Button type="button" variant="secondary" onClick={() => void handleBulkAction('archive')}>
                  Archive selected
                </Button>
              </>
            )}
            {showArchived && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmDelete({ type: 'bulk' })}
              >
                Permanently delete
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <Table columns={columns} data={orders} rowKey={(o) => o.id} />

      {archiveWarning && (
        <DeleteConfirmModal
          title={`Archive ${archiveWarning.orderNumber}?`}
          description="This order is shipped or delivered. Archiving will hide it from the active list. You can restore it later from archived orders."
          confirmText="ARCHIVE"
          warningPoints={['Order hidden from active list', 'Data preserved in database']}
          onConfirm={() => void handleArchive(archiveWarning, true)}
          onCancel={() => setArchiveWarning(null)}
        />
      )}

      {confirmDelete && (
        <DeleteConfirmModal
          title={
            confirmDelete.type === 'bulk'
              ? `Delete ${selectedIds.length} orders permanently?`
              : 'Delete this order permanently?'
          }
          description="This action cannot be undone. The order and all its line items will be permanently removed from the database."
          confirmText="DELETE"
          warningPoints={['Order record', 'All order line items']}
          onConfirm={handlePermanentDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
