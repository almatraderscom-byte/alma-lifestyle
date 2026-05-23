'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/lib/admin-store';
import type { AppSettings } from '@/lib/admin-settings-types';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { SingleImageUploader } from '@/components/admin/ui/SingleImageUploader';
import { AdminTestUpload } from '@/components/admin/settings/AdminTestUpload';
import { useAdminToast } from '@/context/AdminToastContext';
import { cn } from '@/lib/utils';

const TABS = [
  'Store Information',
  'Social Media',
  'Delivery & Shipping',
  'Payment',
  'Currency & Pricing',
  'SEO',
  'Email Notifications',
] as const;

type TabId = (typeof TABS)[number];

const WHATSAPP_CODES = ['+880', '+91', '+1', '+44', '+971'];

export default function AdminSettingsPage() {
  const { toast } = useAdminToast();
  const [tab, setTab] = useState<TabId>('Store Information');
  const [form, setForm] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);
  const [cityInput, setCityInput] = useState('');

  function patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await saveSettings(form);
      toast('Settings saved successfully', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    }
  }

  if (loading || !form) {
    return <p className="text-neutral-500">Loading settings…</p>;
  }

  function addCity() {
    if (!form) return;
    const city = cityInput.trim();
    if (!city || form.freeDeliveryCities.includes(city)) return;
    patch('freeDeliveryCities', [...form.freeDeliveryCities, city]);
    setCityInput('');
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>

      <AdminTestUpload />

      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t ? 'border-[#C97D5D] text-[#C97D5D]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        {tab === 'Store Information' && (
          <>
            <Input label="Store Name" value={form.storeName} onChange={(e) => patch('storeName', e.target.value)} />
            <Input label="Tagline" value={form.tagline} onChange={(e) => patch('tagline', e.target.value)} />
            <SingleImageUploader label="Logo" value={form.logoUrl} onChange={(v) => patch('logoUrl', v)} />
            <SingleImageUploader label="Favicon" value={form.faviconUrl} onChange={(v) => patch('faviconUrl', v)} />
            <Input label="Contact Email" type="email" value={form.contactEmail} onChange={(e) => patch('contactEmail', e.target.value)} />
            <Input label="Contact Phone" value={form.contactPhone} onChange={(e) => patch('contactPhone', e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-neutral-800">WhatsApp country</span>
                <select
                  className="w-full min-h-10 rounded-lg border border-neutral-300 px-3 text-sm"
                  value={form.whatsappCountryCode}
                  onChange={(e) => patch('whatsappCountryCode', e.target.value)}
                >
                  {WHATSAPP_CODES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={(e) => patch('whatsappNumber', e.target.value)} />
              </div>
            </div>
            <Textarea label="Physical Address" rows={3} value={form.physicalAddress} onChange={(e) => patch('physicalAddress', e.target.value)} />
            <Input label="Business Hours" value={form.businessHours} onChange={(e) => patch('businessHours', e.target.value)} />
          </>
        )}

        {tab === 'Social Media' && (
          <>
            <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => patch('facebookUrl', e.target.value)} />
            <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => patch('instagramUrl', e.target.value)} />
            <Input label="YouTube URL" value={form.youtubeUrl} onChange={(e) => patch('youtubeUrl', e.target.value)} />
            <Input label="TikTok URL" value={form.tiktokUrl} onChange={(e) => patch('tiktokUrl', e.target.value)} />
          </>
        )}

        {tab === 'Delivery & Shipping' && (
          <>
            <Input label="Free delivery threshold (BDT)" type="number" value={form.freeDeliveryThresholdBdt} onChange={(e) => patch('freeDeliveryThresholdBdt', Number(e.target.value))} />
            <Input label="Default delivery charge (BDT)" type="number" value={form.defaultDeliveryChargeBdt} onChange={(e) => patch('defaultDeliveryChargeBdt', Number(e.target.value))} />
            <Input label="Outside city delivery charge (BDT)" type="number" value={form.outsideCityDeliveryChargeBdt} onChange={(e) => patch('outsideCityDeliveryChargeBdt', Number(e.target.value))} />
            <Input label="Estimated delivery time" value={form.estimatedDeliveryTime} onChange={(e) => patch('estimatedDeliveryTime', e.target.value)} />
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-800">Free delivery cities</p>
              <div className="flex flex-wrap gap-2">
                {form.freeDeliveryCities.map((city) => (
                  <span key={city} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm">
                    {city}
                    <button type="button" className="text-neutral-500 hover:text-red-600" onClick={() => patch('freeDeliveryCities', form.freeDeliveryCities.filter((c) => c !== city))}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Add city" className="flex-1" />
                <Button type="button" variant="secondary" onClick={addCity}>Add</Button>
              </div>
            </div>
          </>
        )}

        {tab === 'Payment' && (
          <>
            <Toggle label="Enable Cash on Delivery" checked={form.codEnabled} onChange={(v) => patch('codEnabled', v)} />
            <Textarea label="COD instructions" rows={3} value={form.codInstructions} onChange={(e) => patch('codInstructions', e.target.value)} />
            <Toggle label="Enable bKash" checked={form.bkashEnabled} onChange={(v) => patch('bkashEnabled', v)} />
            <Input label="bKash merchant number" value={form.bkashMerchantNumber} onChange={(e) => patch('bkashMerchantNumber', e.target.value)} />
            <Textarea label="bKash instructions" rows={2} value={form.bkashInstructions} onChange={(e) => patch('bkashInstructions', e.target.value)} />
            <Toggle label="Enable Nagad" checked={form.nagadEnabled} onChange={(v) => patch('nagadEnabled', v)} />
            <Input label="Nagad merchant number" value={form.nagadMerchantNumber} onChange={(e) => patch('nagadMerchantNumber', e.target.value)} />
            <Textarea label="Nagad instructions" rows={2} value={form.nagadInstructions} onChange={(e) => patch('nagadInstructions', e.target.value)} />
          </>
        )}

        {tab === 'Currency & Pricing' && (
          <>
            <Input label="Primary currency" value="BDT" disabled />
            <Input label="USD exchange rate (1 USD = X BDT)" type="number" value={form.usdExchangeRate} onChange={(e) => patch('usdExchangeRate', Number(e.target.value))} />
            <Input label="AED exchange rate (1 AED = X BDT)" type="number" value={form.aedExchangeRate} onChange={(e) => patch('aedExchangeRate', Number(e.target.value))} />
            <Toggle label="Show prices in multiple currencies" checked={form.showMultiCurrency} onChange={(v) => patch('showMultiCurrency', v)} />
          </>
        )}

        {tab === 'SEO' && (
          <>
            <Input label="Site title template" value={form.seoSiteTitleTemplate} onChange={(e) => patch('seoSiteTitleTemplate', e.target.value)} />
            <Textarea label="Site description" rows={3} value={form.seoSiteDescription} onChange={(e) => patch('seoSiteDescription', e.target.value)} />
            <SingleImageUploader label="Default OG image" value={form.seoDefaultOgImageUrl} onChange={(v) => patch('seoDefaultOgImageUrl', v)} />
            <Input label="Google Analytics ID" value={form.googleAnalyticsId} onChange={(e) => patch('googleAnalyticsId', e.target.value)} />
            <Input label="Facebook Pixel ID" value={form.facebookPixelId} onChange={(e) => patch('facebookPixelId', e.target.value)} />
          </>
        )}

        {tab === 'Email Notifications' && (
          <>
            <Toggle label="Order confirmation email" checked={form.orderConfirmationEmailEnabled} onChange={(v) => patch('orderConfirmationEmailEnabled', v)} />
            <Toggle label="New order admin notification" checked={form.newOrderAdminNotificationEnabled} onChange={(v) => patch('newOrderAdminNotificationEnabled', v)} />
            <Input label="Email From name" value={form.emailFromName} onChange={(e) => patch('emailFromName', e.target.value)} />
            <Input label="Email From address" type="email" value={form.emailFromAddress} onChange={(e) => patch('emailFromAddress', e.target.value)} />
          </>
        )}

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#C97D5D]" />
    </label>
  );
}
