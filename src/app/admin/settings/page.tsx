'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/lib/admin-store';
import type {
  AppSettings,
  ContentPageConfig,
  FooterColumnConfig,
  NavLinkConfig,
} from '@/lib/admin-settings-types';
import { CONTENT_PAGE_SLUGS, CONTENT_PAGE_LABELS } from '@/lib/admin-settings-types';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { Textarea } from '@/components/admin/ui/Textarea';
import { SmartImageUpload } from '@/components/admin/SmartImageUpload';
import { AdminTestUpload } from '@/components/admin/settings/AdminTestUpload';
import { useAdminToast } from '@/context/AdminToastContext';
import { cn } from '@/lib/utils';
import { AdminCustomerLink } from '@/components/admin/AdminCustomerLink';

const TABS = [
  'Homepage',
  'Store Information',
  'Social Media',
  'Footer & Navigation',
  'Content Pages',
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
  const [cinematicMode, setCinematicMode] = useState(true);
  const [cinematicSaving, setCinematicSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getSettings(),
      fetch('/api/v1/settings/cinematic-mode').then((r) => r.json()),
    ])
      .then(([settings, cinematic]) => {
        setForm(settings);
        if (cinematic?.data?.enabled != null) setCinematicMode(cinematic.data.enabled);
      })
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <AdminCustomerLink href="/" label="View header & footer on site →" />
      </div>

      <AdminTestUpload />

      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t ? 'border-[var(--ob-violet)] text-[var(--ob-violet)]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        {tab === 'Homepage' && (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">Cinematic Homepage</h2>
              <Toggle
                label="Cinematic Homepage"
                checked={cinematicMode}
                onChange={async (enabled) => {
                  setCinematicSaving(true);
                  try {
                    const res = await fetch('/api/v1/settings/cinematic-mode', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled }),
                    });
                    if (!res.ok) throw new Error('Save failed');
                    setCinematicMode(enabled);
                    toast(
                      enabled ? 'Cinematic homepage enabled' : 'Editorial homepage restored',
                      'success'
                    );
                  } catch (err) {
                    toast(err instanceof Error ? err.message : 'Save failed', 'error');
                  } finally {
                    setCinematicSaving(false);
                  }
                }}
              />
              <p className="text-sm text-neutral-600">
                When enabled, homepage shows the cinematic experience. When disabled, falls back to
                editorial layout. Changes take up to 60 seconds to appear on the live site.
              </p>
              {cinematicSaving && (
                <p className="text-xs text-neutral-500">Saving…</p>
              )}
            </div>
          </>
        )}
        {tab === 'Store Information' && (
          <>
            <Input label="Store Name" value={form.storeName} onChange={(e) => patch('storeName', e.target.value)} />
            <Input label="Tagline" value={form.tagline} onChange={(e) => patch('tagline', e.target.value)} />
            <SmartImageUpload
              specKey="logo"
              value={form.logoUrl}
              onChange={(v) => patch('logoUrl', v)}
              upload={{ mode: 'api', folder: 'branding', bucket: 'homepage-images' }}
            />
            <SmartImageUpload
              specKey="favicon"
              value={form.faviconUrl}
              onChange={(v) => patch('faviconUrl', v)}
              upload={{ mode: 'api', folder: 'branding', bucket: 'homepage-images' }}
              showFaviconCacheHint
            />
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

        {tab === 'Footer & Navigation' && (
          <FooterNavEditor form={form} patch={patch} />
        )}

        {tab === 'Content Pages' && (
          <ContentPagesEditor form={form} patch={patch} />
        )}

        {tab === 'Delivery & Shipping' && (
          <>
            <section className="space-y-4 rounded-lg border border-neutral-200 p-4">
              <h3 className="text-base font-semibold text-neutral-900">ডেলিভারি চার্জ / Delivery Charges</h3>
              <Input
                label="ঢাকা সিটির ভিতরে / Dhaka City (BDT)"
                type="number"
                value={form.dhakaCityDeliveryChargeBdt}
                onChange={(e) => patch('dhakaCityDeliveryChargeBdt', Number(e.target.value))}
                placeholder="80"
              />
              <Input
                label="ঢাকার বাইরে / Outside Dhaka (BDT)"
                type="number"
                value={form.outsideCityDeliveryChargeBdt}
                onChange={(e) => patch('outsideCityDeliveryChargeBdt', Number(e.target.value))}
                placeholder="120"
              />
              <div>
                <Input
                  label="ফ্রি ডেলিভারির সীমা / Free Delivery Threshold (BDT)"
                  type="number"
                  value={form.freeDeliveryThresholdBdt}
                  onChange={(e) => patch('freeDeliveryThresholdBdt', Number(e.target.value))}
                  placeholder="2000"
                />
                <p className="mt-1 text-xs text-neutral-500">এর উপরে অর্ডারে ডেলিভারি ফ্রি (সারা দেশ)</p>
              </div>
            </section>
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
            <SmartImageUpload
              specKey="ogImage"
              value={form.seoDefaultOgImageUrl}
              onChange={(v) => patch('seoDefaultOgImageUrl', v)}
              upload={{ mode: 'api', folder: 'branding', bucket: 'homepage-images' }}
            />
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

            <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              <h3 className="text-base font-semibold text-neutral-900">WhatsApp notifications</h3>
              <p className="text-sm text-neutral-600">
                Store Information ট্যাবে WhatsApp নম্বর সেট করুন। নতুন অর্ডারে অ্যাডমিন ইমেইলে
                &quot;WhatsApp এ কনফার্ম করুন&quot; বাটন থাকবে — ক্লিক করলে গ্রাহকের চ্যাটে
                প্রি-ফিল মেসেজ খুলবে (CallMeBot লাগে না)।
              </p>
              <ul className="text-sm text-neutral-700 space-y-1 list-disc list-inside">
                <li>ইমেইল — স্বয়ংক্রিয়</li>
                <li>ব্রাউজার নোটিফিকেশন — অ্যাডমিন প্যানেল খোলা থাকলে (~৩০ সেকেন্ড)</li>
                <li>Orders পেজ — প্রতিটি অর্ডারে WhatsApp Confirm / Call</li>
              </ul>
            </section>
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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--ob-violet)]" />
    </label>
  );
}

/**
 * Editor for the storefront footer (brand tagline, link columns, copyright)
 * and the header navigation. Everything here drives {@link ObsidianFooter} and
 * {@link ObsidianHeader} on the live site via AppSettings.
 */
function FooterNavEditor({
  form,
  patch,
}: {
  form: AppSettings;
  patch: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}) {
  const columns = form.footerColumns ?? [];
  const nav = form.headerNav ?? [];

  const setColumns = (next: FooterColumnConfig[]) => patch('footerColumns', next);
  const setNav = (next: NavLinkConfig[]) => patch('headerNav', next);

  const updateColumn = (ci: number, next: Partial<FooterColumnConfig>) =>
    setColumns(columns.map((c, i) => (i === ci ? { ...c, ...next } : c)));
  const updateLink = (ci: number, li: number, next: Partial<NavLinkConfig>) =>
    updateColumn(ci, {
      links: columns[ci].links.map((l, i) => (i === li ? { ...l, ...next } : l)),
    });

  return (
    <div className="space-y-6">
      <Textarea
        label="Footer tagline (ফুটার ট্যাগলাইন)"
        rows={3}
        value={form.footerTagline}
        onChange={(e) => patch('footerTagline', e.target.value)}
      />

      {/* ---- Footer columns ---- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">Footer columns</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setColumns([...columns, { title: 'New column', links: [] }])}
          >
            + Column
          </Button>
        </div>
        {columns.map((col, ci) => (
          <div key={ci} className="space-y-3 rounded-lg border border-neutral-200 p-4">
            <div className="flex items-end gap-2">
              <Input
                label={`Column ${ci + 1} title`}
                value={col.title}
                onChange={(e) => updateColumn(ci, { title: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setColumns(columns.filter((_, i) => i !== ci))}
              >
                Remove
              </Button>
            </div>
            <div className="space-y-2">
              {col.links.map((l, li) => (
                <div key={li} className="flex items-center gap-2">
                  <Input
                    value={l.label}
                    placeholder="Label"
                    onChange={(e) => updateLink(ci, li, { label: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    value={l.href}
                    placeholder="/path"
                    onChange={(e) => updateLink(ci, li, { href: e.target.value })}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    className="text-neutral-500 hover:text-red-600"
                    aria-label="Remove link"
                    onClick={() =>
                      updateColumn(ci, { links: col.links.filter((_, i) => i !== li) })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateColumn(ci, { links: [...col.links, { label: '', href: '' }] })}
              >
                + Link
              </Button>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Copyright line"
          value={form.footerCopyright}
          onChange={(e) => patch('footerCopyright', e.target.value)}
        />
        <Input
          label="Legal line"
          value={form.footerLegalLine}
          onChange={(e) => patch('footerLegalLine', e.target.value)}
        />
      </div>

      {/* ---- Header navigation ---- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">Header navigation</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setNav([...nav, { label: '', href: '' }])}
          >
            + Nav item
          </Button>
        </div>
        {nav.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-3">
            <Input
              value={item.label}
              placeholder="Label"
              onChange={(e) => setNav(nav.map((n, j) => (j === i ? { ...n, label: e.target.value } : n)))}
              className="flex-1 min-w-[8rem]"
            />
            <Input
              value={item.href}
              placeholder="/path"
              onChange={(e) => setNav(nav.map((n, j) => (j === i ? { ...n, href: e.target.value } : n)))}
              className="flex-1 min-w-[8rem]"
            />
            <label className="flex items-center gap-1.5 text-xs text-neutral-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={!!item.social}
                onChange={(e) => setNav(nav.map((n, j) => (j === i ? { ...n, social: e.target.checked } : n)))}
                className="h-4 w-4 accent-[var(--ob-violet)]"
              />
              Contact icons
            </label>
            <button
              type="button"
              className="text-neutral-500 hover:text-red-600"
              aria-label="Remove nav item"
              onClick={() => setNav(nav.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

/**
 * Editor for the static content/legal pages (about, faq, delivery, refund,
 * privacy, terms, size-guide). Each field overrides the page's built-in
 * default; leaving a field blank keeps the current live content. The body is
 * optional raw HTML — when filled it replaces the whole page body.
 */
function ContentPagesEditor({
  form,
  patch,
}: {
  form: AppSettings;
  patch: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}) {
  const [slug, setSlug] = useState<string>(CONTENT_PAGE_SLUGS[0]);
  const pages = form.contentPages ?? {};
  const page: ContentPageConfig = pages[slug] ?? {};

  const update = (next: Partial<ContentPageConfig>) =>
    patch('contentPages', { ...pages, [slug]: { ...page, ...next } });

  return (
    <div className="space-y-5">
      <label className="space-y-1.5 block">
        <span className="text-sm font-medium text-neutral-800">Page</span>
        <select
          className="w-full min-h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          {CONTENT_PAGE_SLUGS.map((s) => (
            <option key={s} value={s}>
              {CONTENT_PAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
        যেকোনো ঘর খালি রাখলে ওই পেজের বর্তমান লেখা অপরিবর্তিত থাকবে। Leave a field blank to
        keep the current built-in content for that page.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Badge" value={page.badge ?? ''} onChange={(e) => update({ badge: e.target.value })} />
        <Input label="Hero word (Latin)" value={page.heroWord ?? ''} onChange={(e) => update({ heroWord: e.target.value })} />
      </div>
      <Input label="Title" value={page.title ?? ''} onChange={(e) => update({ title: e.target.value })} />
      <Input label="Subtitle" value={page.subtitle ?? ''} onChange={(e) => update({ subtitle: e.target.value })} />
      <Input label="Last updated" value={page.lastUpdated ?? ''} onChange={(e) => update({ lastUpdated: e.target.value })} />
      <div>
        <Textarea
          label="Body (HTML — optional, replaces the whole page body)"
          rows={12}
          value={page.bodyHtml ?? ''}
          onChange={(e) => update({ bodyHtml: e.target.value })}
          placeholder="<h2>শিরোনাম</h2>\n<p>...</p>"
        />
        <p className="mt-1 text-xs text-neutral-500">
          HTML ট্যাগ ব্যবহার করুন: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;,
          &lt;table&gt;। খালি রাখলে পেজের নিজস্ব লেখা দেখাবে।
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-4">
        <h3 className="text-base font-semibold text-neutral-900">SEO (এই পেজের জন্য)</h3>
        <Input
          label="Meta title"
          value={page.seoTitle ?? ''}
          onChange={(e) => update({ seoTitle: e.target.value })}
          placeholder="Google-এ দেখানো শিরোনাম"
        />
        <Textarea
          label="Meta description"
          rows={3}
          value={page.seoDescription ?? ''}
          onChange={(e) => update({ seoDescription: e.target.value })}
          placeholder="সার্চ রেজাল্টে দেখানো সংক্ষিপ্ত বর্ণনা (~155 অক্ষর)"
        />
        <Input
          label="Keywords (কমা দিয়ে আলাদা করুন)"
          value={page.seoKeywords ?? ''}
          onChange={(e) => update({ seoKeywords: e.target.value })}
          placeholder="পাঞ্জাবি, ডেলিভারি, ..."
        />
      </section>
    </div>
  );
}
