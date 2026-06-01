'use client';

import { useEffect, useState } from 'react';
import { DistrictSelector } from '@/components/checkout/DistrictSelector';
import { CHECKOUT } from '@/lib/content';
import { getZoneLabel } from '@/lib/delivery';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  district: string;
  thana: string;
  address: string;
  note: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
}

export interface CheckoutFormErrors {
  name?: string;
  phone?: string;
  district?: string;
  thana?: string;
  address?: string;
  transactionId?: string;
}

interface CheckoutFormProps {
  districtValue: string;
  onDistrictChange: (district: string) => void;
  onSubmit: (data: CheckoutFormData) => void;
  isSubmitting?: boolean;
  hideSubmitButton?: boolean;
}

const initialForm: CheckoutFormData = {
  name: '',
  phone: '',
  email: '',
  district: '',
  thana: '',
  address: '',
  note: '',
  paymentMethod: 'cod',
  transactionId: '',
};

function isValidBdPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^01[3-9]\d{8}$/.test(digits);
}

export function CheckoutForm({
  districtValue,
  onDistrictChange,
  onSubmit,
  isSubmitting = false,
  hideSubmitButton = false,
}: CheckoutFormProps) {
  const settings = useStoreSettings();
  const [form, setForm] = useState<CheckoutFormData>({
    ...initialForm,
    district: districtValue,
  });
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, district: districtValue }));
  }, [districtValue]);

  useEffect(() => {
    const allowed: PaymentMethod[] = [];
    if (settings.codEnabled) allowed.push('cod');
    if (settings.bkashEnabled) allowed.push('bkash');
    if (settings.nagadEnabled) allowed.push('nagad');
    if (allowed.length > 0 && !allowed.includes(form.paymentMethod)) {
      setForm((prev) => ({ ...prev, paymentMethod: allowed[0] }));
    }
  }, [settings, form.paymentMethod]);

  function updateField<K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'district') {
      onDistrictChange(value as string);
    }
  }

  function validate(): CheckoutFormErrors {
    const next: CheckoutFormErrors = {};
    if (!form.name.trim()) next.name = CHECKOUT.errors.name;
    if (!isValidBdPhone(form.phone)) next.phone = CHECKOUT.errors.phone;
    if (!form.district) next.district = CHECKOUT.errors.district;
    if (!form.thana.trim()) next.thana = CHECKOUT.errors.thana;
    if (!form.address.trim()) next.address = CHECKOUT.errors.address;
    if (
      (form.paymentMethod === 'bkash' || form.paymentMethod === 'nagad') &&
      !form.transactionId.trim()
    ) {
      next.transactionId = CHECKOUT.errors.transactionId;
    }
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(form);
  }

  const showErrors = touched;
  const paymentNumber =
    form.paymentMethod === 'bkash'
      ? settings.bkashMerchantNumber || '01307777733'
      : form.paymentMethod === 'nagad'
        ? settings.nagadMerchantNumber || '01307777733'
        : '';

  const zoneLabel = districtValue ? getZoneLabel(districtValue) : '';

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="font-bn-heading text-xl font-bold text-charcoal mb-2">
          {CHECKOUT.customerSection}
        </legend>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={CHECKOUT.nameLabel} error={showErrors ? errors.name : undefined} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={CHECKOUT.namePlaceholder}
              className={inputClass(showErrors && !!errors.name)}
              autoComplete="name"
            />
          </Field>

          <Field label={CHECKOUT.phoneLabel} error={showErrors ? errors.phone : undefined} required>
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder={CHECKOUT.phonePlaceholder}
              className={inputClass(showErrors && !!errors.phone)}
              autoComplete="tel"
            />
          </Field>
        </div>

        <Field label={CHECKOUT.emailLabel}>
          <input
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder={CHECKOUT.emailPlaceholder}
            className={inputClass()}
            autoComplete="email"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-bn-heading text-xl font-bold text-charcoal mb-2">
          {CHECKOUT.addressSection}
        </legend>

        <DistrictSelector
          value={form.district}
          onChange={(d) => updateField('district', d)}
          error={showErrors ? errors.district : undefined}
        />

        {zoneLabel && (
          <p className="font-bn-body text-sm text-terracotta -mt-2">{zoneLabel}</p>
        )}

        <Field label={CHECKOUT.thanaLabel} error={showErrors ? errors.thana : undefined} required>
          <input
            type="text"
            value={form.thana}
            onChange={(e) => updateField('thana', e.target.value)}
            placeholder={CHECKOUT.thanaPlaceholder}
            className={inputClass(showErrors && !!errors.thana)}
          />
        </Field>

        <Field
          label={CHECKOUT.addressLabel}
          error={showErrors ? errors.address : undefined}
          required
        >
          <textarea
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder={CHECKOUT.addressPlaceholder}
            rows={3}
            className={cn(inputClass(showErrors && !!errors.address), 'resize-y min-h-[100px]')}
          />
        </Field>

        <Field label={CHECKOUT.noteLabel}>
          <textarea
            value={form.note}
            onChange={(e) => updateField('note', e.target.value)}
            placeholder={CHECKOUT.notePlaceholder}
            rows={2}
            className={cn(inputClass(), 'resize-y')}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-bn-heading text-xl font-bold text-charcoal mb-2">
          {CHECKOUT.paymentSection}
        </legend>

        {settings.codEnabled && (
          <PaymentOption
            id="pay-cod"
            checked={form.paymentMethod === 'cod'}
            onChange={() => updateField('paymentMethod', 'cod')}
            title={CHECKOUT.paymentCod}
            subtitle="পণ্য হাতে পেয়ে পেমেন্ট করুন"
            badge="💵"
          />
        )}
        {settings.bkashEnabled && (
          <PaymentOption
            id="pay-bkash"
            checked={form.paymentMethod === 'bkash'}
            onChange={() => updateField('paymentMethod', 'bkash')}
            title={CHECKOUT.paymentBkash}
            subtitle={`Send money to: ${settings.bkashMerchantNumber || '01307-777733'}`}
            badge="bKash"
            badgeClass="text-pink-600 font-bold"
          />
        )}
        {settings.nagadEnabled && (
          <PaymentOption
            id="pay-nagad"
            checked={form.paymentMethod === 'nagad'}
            onChange={() => updateField('paymentMethod', 'nagad')}
            title={CHECKOUT.paymentNagad}
            subtitle={`Send money to: ${settings.nagadMerchantNumber || '01307-777733'}`}
            badge="Nagad"
            badgeClass="text-orange-600 font-bold"
          />
        )}

        {(form.paymentMethod === 'bkash' || form.paymentMethod === 'nagad') && (
          <div className="space-y-3 rounded-lg border border-border-subtle bg-cream/60 p-4">
            <p className="font-bn-body text-sm text-charcoal leading-relaxed">
              {CHECKOUT.paymentInstruction.replace('{number}', paymentNumber)}
            </p>
            <Field
              label={CHECKOUT.transactionIdLabel}
              error={showErrors ? errors.transactionId : undefined}
              required
            >
              <input
                type="text"
                value={form.transactionId}
                onChange={(e) => updateField('transactionId', e.target.value)}
                placeholder={CHECKOUT.transactionIdPlaceholder}
                className={inputClass(showErrors && !!errors.transactionId)}
              />
            </Field>
          </div>
        )}
      </fieldset>

      {!hideSubmitButton && (
        <div className="space-y-3 lg:hidden">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-14 rounded-lg bg-terracotta font-bn-body text-lg font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
          >
            {isSubmitting ? CHECKOUT.submitting : CHECKOUT.submit}
          </button>
          <p className="font-bn-body text-xs text-center text-text-light leading-relaxed">
            {CHECKOUT.terms}
          </p>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-bn-body text-base font-medium text-charcoal mb-1.5">
        {label}
        {required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 font-bn-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError?: boolean) {
  return cn(
    'w-full min-h-12 rounded-lg border px-4 font-bn-body text-base bg-white text-charcoal',
    'focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta',
    hasError ? 'border-red-500' : 'border-border-subtle'
  );
}

function PaymentOption({
  id,
  checked,
  onChange,
  title,
  subtitle,
  badge,
  badgeClass,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
  badge: string;
  badgeClass?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition',
        checked ? 'border-terracotta bg-cream' : 'border-border-subtle bg-white hover:border-neutral-300'
      )}
    >
      <input
        id={id}
        type="radio"
        name="payment"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-terracotta"
      />
      <div className="flex-1 min-w-0">
        <div className="font-bn-body font-medium text-charcoal">{title}</div>
        <div className="font-bn-body text-sm text-text-light">{subtitle}</div>
      </div>
      <span className={cn('text-sm shrink-0', badgeClass)}>{badge}</span>
    </label>
  );
}
