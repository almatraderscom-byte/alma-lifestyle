'use client';

import { BANGLADESH_DISTRICTS } from '@/lib/bangladesh-districts';
import { getFreeDeliveryThreshold, getZoneCharges } from '@/lib/delivery-settings';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { cn } from '@/lib/utils';

interface DistrictSelectorProps {
  value: string;
  onChange: (district: string) => void;
  error?: string;
}

export function DistrictSelector({ value, onChange, error }: DistrictSelectorProps) {
  const settings = useStoreSettings();
  const charges = getZoneCharges(settings);
  const freeThreshold = getFreeDeliveryThreshold(settings);

  return (
    <div>
      <label className="block font-bn-body text-base font-medium text-charcoal mb-1.5">
        জেলা / District <span className="text-terracotta">*</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full min-h-12 rounded-lg border px-4 font-bn-body text-base bg-white text-charcoal',
          'focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta',
          error ? 'border-red-500' : 'border-border-subtle'
        )}
        required
      >
        <option value="">— জেলা নির্বাচন করুন —</option>

        <optgroup label="ঢাকা সিটি">
          <option value="ঢাকা সিটি">
            ঢাকা সিটি — ৳{charges.dhaka_city} ডেলিভারি
          </option>
        </optgroup>

        <optgroup label="ঢাকার বাইরে (গাজীপুর, নারায়ণগঞ্জ সহ সব জেলা)">
          {BANGLADESH_DISTRICTS.filter((d) => d.zone === 'outside_dhaka').map((d) => (
            <option key={d.name_en} value={d.name_bn}>
              {d.name_bn} — ৳{charges.outside_dhaka}
            </option>
          ))}
        </optgroup>
      </select>

      {error && (
        <p className="mt-1.5 font-bn-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="mt-1.5 font-bn-body text-xs text-text-light">
        ৳{freeThreshold.toLocaleString('en-US')}+ অর্ডারে ফ্রি ডেলিভারি
      </p>
    </div>
  );
}
