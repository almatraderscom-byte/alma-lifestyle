'use client';

import { useEffect, useState } from 'react';
import { newDatabaseId } from '@/lib/admin-ids';
import { shouldUseApi } from '@/lib/data-source';
import { getCollections, saveCollection, deleteCollection, uid } from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';

export default function AdminCollectionsPage() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState<Awaited<ReturnType<typeof getCollections>>>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setItems(await getCollections());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const now = new Date().toISOString();
    try {
      await saveCollection({
        id: shouldUseApi() ? newDatabaseId() : uid('col'),
        name: name.trim(),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        productIds: [],
        createdAt: now,
        updatedAt: now,
      });
      await refresh();
      setName('');
      toast('Collection added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  if (loading) return <p className="text-neutral-500">Loading collections…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Collections</h1>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        <Button type="submit">Add</Button>
      </form>
      <ul className="rounded-xl border border-neutral-200 bg-white divide-y">
        {items.map((col) => (
          <li key={col.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{col.name}</p>
              <p className="text-xs text-neutral-500">{col.productIds.length} products</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (confirm('Delete collection?')) {
                  await deleteCollection(col.id);
                  await refresh();
                }
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
