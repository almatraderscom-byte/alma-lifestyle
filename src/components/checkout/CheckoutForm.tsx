'use client';

import { useState } from 'react';
import { CHECKOUT } from '@/lib/content';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  note: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
}

export interface CheckoutFormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  transactionId?: string;
}

interface CheckoutFormProps {
  cityValue: string;
  onCityChange: (city: string) => void;
  onSubmit: (data: CheckoutFormData) => void;
  isSubmitting?: boolean;
}

const initialForm: CheckoutFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postcode: '',
  note: '',
  paymentMethod: 'cod',
  transactionId: '',
};

function isValidBdPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^01[3-9]\d{8}$/.test(digits);
}

export function CheckoutForm({
  cityValue,
  onCityChange,
  onSubmit,
  isSubmitting = false,
}: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>({ ...initialForm, city: cityValue });
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState(false);

  function updateField<K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'city') {
      onCityChange(value as string);
    }
  }

  function validate(): CheckoutFormErrors {
    const next: CheckoutFormErrors = {};
    if (!form.name.trim()) next.name = CHECKOUT.errors.name;
    if (!isValidBdPhone(form.phone)) next.phone = CHECKOUT.errors.phone;
    if (!form.address.trim()) next.address = CHECKOUT.errors.address;
    if (!form.city) next.city = CHECKOUT.errors.city;
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
      ? CHECKOUT.bkashNumber
      : form.paymentMethod === 'nagad'
        ? CHECKOUT.nagadNumber
        : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="font-bn-heading text-xl font-bold text-primary mb-2">
          {CHECKOUT.customerSection}
        </legend>

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
        <legend className="font-bn-heading text-xl font-bold text-primary mb-2">
          {CHECKOUT.addressSection}
        </legend>

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

        <Field label={CHECKOUT.cityLabel} error={showErrors ? errors.city : undefined} required>
          <select
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={inputClass(showErrors && !!errors.city)}
          >
            <option value="">{CHECKOUT.cityPlaceholder}</option>
            {CHECKOUT.cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={CHECKOUT.postcodeLabel}>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => updateField('postcode', e.target.value)}
            placeholder={CHECKOUT.postcodePlaceholder}
            className={inputClass()}
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
        <legend className="font-bn-heading text-xl font-bold text-primary mb-2">
          {CHECKOUT.paymentSection}
        </legend>

        <PaymentOption
          id="pay-cod"
          checked={form.paymentMethod === 'cod'}
          onChange={() => updateField('paymentMethod', 'cod')}
          label={`💵 ${CHECKOUT.paymentCod}`}
        />
        <PaymentOption
          id="pay-bkash"
          checked={form.paymentMethod === 'bkash'}
          onChange={() => updateField('paymentMethod', 'bkash')}
          label={`📱 ${CHECKOUT.paymentBkash}`}
        />
        <PaymentOption
          id="pay-nagad"
          checked={form.paymentMethod === 'nagad'}
          onChange={() => updateField('paymentMethod', 'nagad')}
          label={`📱 ${CHECKOUT.paymentNagad}`}
        />

        {(form.paymentMethod === 'bkash' || form.paymentMethod === 'nagad') && (
          <div className="rounded-lg bg-secondary/80 p-4 space-y-3">
            <p className="font-bn-body text-sm text-primary leading-relaxed">
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

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-14 rounded-lg bg-accent text-white font-bn-body text-lg font-semibold hover:bg-[#7a6549] disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? CHECKOUT.submitting : CHECKOUT.submit}
        </button>
        <p className="font-bn-body text-xs text-center text-text-light leading-relaxed">
          {CHECKOUT.terms}
        </p>
      </div>
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
      <label className="block font-bn-body text-base font-medium text-primary mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
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
    'w-full min-h-12 rounded-lg border px-4 font-bn-body text-base bg-background text-primary',
    'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent',
    hasError ? 'border-red-500' : 'border-border-subtle'
  );
}

function PaymentOption({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-3 min-h-14 px-4 rounded-xl border-2 cursor-pointer transition-colors',
        checked ? 'border-accent bg-accent/5' : 'border-border-subtle bg-background'
      )}
    >
      <input
        id={id}
        type="radio"
        name="payment"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-accent"
      />
      <span className="font-bn-body text-base font-medium text-primary">{label}</span>
    </label>
  );
}
