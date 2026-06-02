import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEmailBrandingContext } from '@/server/notifications/email-brand';
import { buildTestEmail } from '@/server/notifications/templates/test-email';
import {
  getNotificationEnvDiagnostics,
  sendEmailToCustomer,
  sendWhatsAppToAdmin,
} from '@/server/notifications';
import { withAdmin } from '@/server/api/handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    return NextResponse.json({
      status: 'ok',
      env: getNotificationEnvDiagnostics(),
      timestamp: new Date().toISOString(),
    });
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const body = (await request.json()) as { type?: string; email?: string };

      console.log('[Test API] Received request:', {
        type: body.type,
        email: body.email ? `${body.email.substring(0, 3)}...` : undefined,
      });

      console.log('[Test API] Environment status:', getNotificationEnvDiagnostics());

      if (body.type === 'email') {
        const recipient = body.email?.trim() || process.env.ADMIN_EMAIL?.trim();

        if (!recipient) {
          return NextResponse.json(
            {
              success: false,
              error: 'No email recipient provided and ADMIN_EMAIL not set',
            },
            { status: 400 }
          );
        }

        const brand = await getEmailBrandingContext();
        const fromDisplay =
          getNotificationEnvDiagnostics().resolvedFrom ||
          process.env.FROM_EMAIL?.trim() ||
          'onboarding@resend.dev';

        const result = await sendEmailToCustomer(
          recipient,
          '🧪 ALMA Notification Test',
          buildTestEmail(recipient, fromDisplay, brand),
          {
            notificationType: 'admin_test_email',
            triggeredBy: 'admin_test',
          }
        );

        return NextResponse.json(result, {
          status: result.success ? 200 : 500,
        });
      }

      if (body.type === 'whatsapp') {
        const result = await sendWhatsAppToAdmin(
          `🧪 *ALMA Notification Test*\n\nIf you receive this, WhatsApp notifications are working! ✅\n\nTime: ${new Date().toLocaleString()}`,
          {
            notificationType: 'admin_test_whatsapp',
            triggeredBy: 'admin_test',
          }
        );

        return NextResponse.json(result, {
          status: result.success ? 200 : 500,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Unknown notification type. Use "email" or "whatsapp".',
        },
        { status: 400 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Test API] Unexpected error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Server error: ${message}`,
        },
        { status: 500 }
      );
    }
  });
}
