import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { upsertCustomerProfile } from '@/server/db/queries/customers';
import { apiError, apiSuccess } from '@/server/api/response';
import { withPublicDb } from '@/server/api/handler';
import { tryRequireCustomer } from '@/server/api/auth';

const BodySchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6).optional(),
});

export async function POST(request: NextRequest) {
  return withPublicDb(async () => {
    const auth = await tryRequireCustomer(request);
    if (!auth) {
      return apiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    const parts = parsed.data.fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || null;

    const customer = await upsertCustomerProfile({
      id: auth.userId,
      email: auth.email,
      firstName,
      lastName: lastName ?? undefined,
      phone: parsed.data.phone,
    });

    return apiSuccess({ id: customer.id });
  });
}
