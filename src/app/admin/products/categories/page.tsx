'use client';

import { useState } from 'react';
import { getCategories, saveCategory, deleteCategory, uid } from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';

export default function AdminCategoriesPage() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState(() => getCategories());
  const [name, setName] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    saveCategory({
      id: uid('cat'),
      name: name.trim(),
      slug,
      createdAt: now,
      updatedAt: now,
    });
    setItems(getCategories());
    setName('');
    toast('Category added', 'success');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="rounded-xl border border-neutral-200 bg-white divide-y">
        {items.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-neutral-500">{cat.slug}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Delete category?')) {
                  deleteCategory(cat.id);
                  setItems(getCategories());
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
