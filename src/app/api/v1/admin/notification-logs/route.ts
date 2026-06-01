import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/server/db/client';
import { withAdmin } from '@/server/api/handler';
import { apiError, apiSuccess } from '@/server/api/response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const { searchParams } = request.nextUrl;
    const success = searchParams.get('success');
    const limitRaw = searchParams.get('limit') ?? '100';
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 100, 1), 500);

    let query = supabaseAdmin
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (success === 'true') {
      query = query.eq('success', true);
    }
    if (success === 'false') {
      query = query.eq('success', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Notification Logs API]', error.message);
      return apiError(error.message, 500, 'DB_ERROR');
    }

    return apiSuccess(data ?? []);
  });
}
