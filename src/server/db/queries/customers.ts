import { getSupabaseAdmin } from '../client';
import type { Customer, Json } from '../schema';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';

export async function upsertCustomerProfile(input: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultShippingAddress?: Json | null;
}): Promise<Customer> {
  const brandId = await getBrandId();
  const row = {
    id: input.id,
    brand_id: brandId,
    email: input.email,
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    phone: input.phone ?? null,
    default_shipping_address: input.defaultShippingAddress ?? null,
    active: true,
  };

  const { data, error } = await getSupabaseAdmin()
    .from('customers')
    .upsert(row as never, { onConflict: 'id' })
    .select()
    .single();

  assertNoError(error, 'upsertCustomerProfile');
  return data as unknown as Customer;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'getCustomerById');
  return data as Customer | null;
}
