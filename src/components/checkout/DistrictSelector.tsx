'use client';

import {
  BANGLADESH_DISTRICTS,
  DELIVERY_CHARGES,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/bangladesh-districts';
import { cn } from '@/lib/utils';

interface DistrictSelectorProps {
  value: string;
  onChange: (district: string) => void;
  error?: string;
}

export function DistrictSelector({ value, onChange, error }: DistrictSelectorProps) {
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
            ঢাকা সিটি — ৳{DELIVERY_CHARGES.dhaka_city} ডেলিভারি
          </option>
        </optgroup>

        <optgroup label="ঢাকা জেলা ও আশেপাশে">
          {BANGLADESH_DISTRICTS.filter((d) => d.zone === 'dhaka_district').map((d) => (
            <option key={d.name_en} value={d.name_bn}>
              {d.name_bn} — ৳{DELIVERY_CHARGES.dhaka_district}
            </option>
          ))}
        </optgroup>

        <optgroup label="ঢাকার বাইরে">
          {BANGLADESH_DISTRICTS.filter((d) => d.zone === 'outside_dhaka').map((d) => (
            <option key={d.name_en} value={d.name_bn}>
              {d.name_bn} — ৳{DELIVERY_CHARGES.outside_dhaka}
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
        ৳{FREE_DELIVERY_THRESHOLD.toLocaleString('en-US')}+ অর্ডারে ফ্রি ডেলিভারি
      </p>
    </div>
  );
}
