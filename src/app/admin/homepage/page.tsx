'use client';

import { useState } from 'react';
import { getHomepageConfig, saveHomepageConfig } from '@/lib/admin-store';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { useAdminToast } from '@/context/AdminToastContext';

export default function AdminHomepagePage() {
  const { toast } = useAdminToast();
  const initial = getHomepageConfig();
  const [heroTitle, setHeroTitle] = useState(initial?.heroTitle ?? '');
  const [heroSubtitle, setHeroSubtitle] = useState(initial?.heroSubtitle ?? '');

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveHomepageConfig({
      heroTitle,
      heroSubtitle,
      featuredProductIds: initial?.featuredProductIds ?? [],
      updatedAt: new Date().toISOString(),
    });
    toast('Homepage config saved', 'success');
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Homepage Builder</h1>
      <p className="text-sm text-neutral-500">
        Configure homepage content. Full visual builder coming when connected to Supabase.
      </p>
      <form onSubmit={handleSave} className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <Input label="Hero Title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
        <Textarea
          label="Hero Subtitle"
          rows={3}
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
