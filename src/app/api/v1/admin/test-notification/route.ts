import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendEmailToCustomer, sendWhatsAppToAdmin } from '@/server/notifications';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';

const BodySchema = z.object({
  type: z.enum(['whatsapp', 'email']),
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 400, 'VALIDATION_ERROR');
    }

    if (parsed.data.type === 'whatsapp') {
      const success = await sendWhatsAppToAdmin(
        '🧪 ALMA notification test — সব কিছু কাজ করছে!'
      );
      return apiSuccess({ success });
    }

    const to =
      parsed.data.email ??
      process.env.ADMIN_EMAIL?.trim() ??
      'onboarding@resend.dev';

    const success = await sendEmailToCustomer(
      to,
      'ALMA Notification Test',
      '<h1>Test successful!</h1><p>This is a test from the ALMA admin panel.</p>'
    );
    return apiSuccess({ success });
  });
}
