import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ensureHomepageConfig } from '@/lib/homepage-config';
import { getDefaultHomepageExtras, getDefaultOurProcessSection } from '@/lib/homepage-extras';
import {
  getHomepageConfigOrDefault,
  saveHomepageConfig,
} from '@/server/db/queries/homepage';
import { apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const current = await getHomepageConfigOrDefault();
    const defaults = getDefaultHomepageExtras();

    const updated = ensureHomepageConfig({
      ...current,
      extras: {
        familyMatching: current.extras?.familyMatching ?? defaults.familyMatching,
        ourProcess: getDefaultOurProcessSection(),
      },
    });

    await saveHomepageConfig(updated);

    revalidatePath('/');
    revalidatePath('/admin/homepage');

    return apiSuccess({ success: true, ourProcess: updated.extras?.ourProcess });
  });
}
