'use client';

import { useState } from 'react';
import { getSettings, saveSettings } from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';

export default function AdminSettingsPage() {
  const { toast } = useAdminToast();
  const initial = getSettings();
  const [form, setForm] = useState({
    storeName: initial?.storeName ?? 'ALMA Lifestyle',
    supportEmail: initial?.supportEmail ?? '',
    supportPhone: initial?.supportPhone ?? '',
    bdtToUsd: initial?.bdtToUsd ?? 0.0091,
    bdtToAed: initial?.bdtToAed ?? 0.033,
    lowStockThreshold: initial?.lowStockThreshold ?? 10,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({
      ...form,
      updatedAt: new Date().toISOString(),
    });
    toast('Settings saved', 'success');
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
      <form onSubmit={handleSave} className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <Input
          label="Store Name"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
        />
        <Input
          label="Support Email"
          type="email"
          value={form.supportEmail}
          onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
        />
        <Input
          label="Support Phone"
          value={form.supportPhone}
          onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
        />
        <Input
          label="BDT → USD rate"
          type="number"
          step="0.0001"
          value={form.bdtToUsd}
          onChange={(e) => setForm({ ...form, bdtToUsd: Number(e.target.value) })}
        />
        <Input
          label="BDT → AED rate"
          type="number"
          step="0.0001"
          value={form.bdtToAed}
          onChange={(e) => setForm({ ...form, bdtToAed: Number(e.target.value) })}
        />
        <Input
          label="Low stock threshold"
          type="number"
          value={form.lowStockThreshold}
          onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
        />
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
