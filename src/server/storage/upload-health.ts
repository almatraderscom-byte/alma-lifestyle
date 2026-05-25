// TODO: remove after upload issue is resolved

import { getSupabaseAdmin } from '@/server/db/client';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import type { UploadHealthCheck, UploadHealthReport } from '@/lib/upload-health-types';

export type { UploadHealthCheck, UploadHealthReport } from '@/lib/upload-health-types';

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

function supabaseProjectHostname(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return '';
  try {
    return new URL(raw).hostname;
  } catch {
    return '';
  }
}

async function runCheck(
  name: string,
  fn: () => Promise<Record<string, unknown>>
): Promise<UploadHealthCheck> {
  const started = Date.now();
  try {
    const detail = await fn();
    return { name, ok: true, durationMs: Date.now() - started, detail };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const error: UploadHealthCheck['error'] = { message };
    if (err && typeof err === 'object') {
      const rec = err as Record<string, unknown>;
      if (typeof rec.code === 'string') error.code = rec.code;
      if (typeof rec.statusCode === 'string' || typeof rec.statusCode === 'number') {
        error.statusCode = rec.statusCode;
      }
    }
    return {
      name,
      ok: false,
      durationMs: Date.now() - started,
      detail: {},
      error,
    };
  }
}

function summarize(checks: UploadHealthCheck[]): string {
  const failed = checks.filter((c) => !c.ok).map((c) => c.name);
  if (failed.length === 0) {
    return `All ${checks.length} checks passed`;
  }
  return `${failed.length} check${failed.length === 1 ? '' : 's'} failed: ${failed.join(', ')}`;
}

export async function runUploadHealthChecks(): Promise<UploadHealthReport> {
  const totalStarted = Date.now();
  const checks: UploadHealthCheck[] = [];
  let probePath: string | null = null;

  checks.push(
    await runCheck('env_vars', async () => {
      const present: string[] = [];
      const missing: string[] = [];
      for (const key of ENV_KEYS) {
        const value = process.env[key];
        if (value && value.trim().length > 0) {
          present.push(key);
        } else {
          missing.push(key);
        }
      }
      const serviceRoleKeyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0;
      if (missing.length > 0) {
        throw new Error(`Missing env: ${missing.join(', ')}`);
      }
      return { present, missing, serviceRoleKeyLength };
    })
  );

  checks.push(
    await runCheck('supabase_admin_client', async () => {
      if (!isSupabaseAdminConfigured()) {
        throw new Error('Supabase admin is not configured (URL, anon key, or service role missing)');
      }
      const client = getSupabaseAdmin();
      return {
        configured: true,
        publicSupabaseConfigured: isSupabaseConfigured(),
        clientCreated: Boolean(client),
      };
    })
  );

  checks.push(
    await runCheck('bucket_exists', async () => {
      const client = getSupabaseAdmin();
      const { data: buckets, error } = await client.storage.listBuckets();
      if (error) {
        const e = new Error(error.message) as Error & { code?: string };
        e.code = error.name;
        throw e;
      }
      const homepage = (buckets ?? []).find((b) => b.name === 'homepage-images');
      if (!homepage) {
        throw new Error('homepage-images bucket not found');
      }
      return {
        bucketName: homepage.name,
        public: homepage.public ?? null,
        fileSizeLimit: homepage.file_size_limit ?? null,
        allBuckets: (buckets ?? []).map((b) => b.name),
      };
    })
  );

  checks.push(
    await runCheck('bucket_writable_probe', async () => {
      const client = getSupabaseAdmin();
      probePath = `_healthcheck/${Date.now()}.txt`;
      const payload = Buffer.from('healthcheck');

      const uploadStarted = Date.now();
      const { error: uploadError } = await client.storage
        .from('homepage-images')
        .upload(probePath, payload, {
          upsert: true,
          contentType: 'text/plain',
        });
      const uploadDurationMs = Date.now() - uploadStarted;

      if (uploadError) {
        const e = new Error(uploadError.message) as Error & { code?: string };
        e.code = uploadError.name;
        throw Object.assign(e, {
          uploadDurationMs,
          supabaseError: {
            message: uploadError.message,
            name: uploadError.name,
          },
        });
      }

      const deleteStarted = Date.now();
      const { error: deleteError } = await client.storage
        .from('homepage-images')
        .remove([probePath]);
      const deleteDurationMs = Date.now() - deleteStarted;

      if (deleteError) {
        const e = new Error(deleteError.message) as Error & { code?: string };
        e.code = deleteError.name;
        throw Object.assign(e, { uploadDurationMs, deleteDurationMs });
      }

      return {
        path: probePath,
        uploadDurationMs,
        deleteDurationMs,
        bytesWritten: payload.length,
      };
    })
  );

  checks.push(
    await runCheck('public_url_resolvable', async () => {
      if (!probePath) {
        throw new Error('No probe path from bucket_writable_probe');
      }
      const client = getSupabaseAdmin();
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const { data } = client.storage.from('homepage-images').getPublicUrl(probePath);
      const publicUrl = data.publicUrl ?? '';
      if (!publicUrl) {
        throw new Error('getPublicUrl returned empty string');
      }
      let projectOrigin = '';
      try {
        projectOrigin = new URL(projectUrl).origin;
      } catch {
        throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL');
      }
      if (!publicUrl.startsWith(projectOrigin)) {
        throw new Error(
          `Public URL does not start with project origin (${projectOrigin})`
        );
      }
      return {
        path: probePath,
        publicUrl,
        projectOrigin,
        hostname: new URL(publicUrl).hostname,
      };
    })
  );

  checks.push(
    await runCheck('next_image_remote_pattern', async () => {
      const expectedRemoteHost = supabaseProjectHostname();
      if (!expectedRemoteHost) {
        throw new Error('Cannot derive Supabase hostname from NEXT_PUBLIC_SUPABASE_URL');
      }
      return {
        expectedRemoteHost,
        hint: 'Verify next.config.ts images.remotePatterns includes this hostname',
        manualVerificationRequired: true,
      };
    })
  );

  checks.push(
    await runCheck('runtime_info', async () => {
      return {
        nodeVersion: process.version,
        nextRuntime: 'nodejs',
        region: process.env.VERCEL_REGION ?? null,
        deploymentUrl: process.env.VERCEL_URL ?? null,
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      };
    })
  );

  const overallOk = checks.every((c) => c.ok);
  return {
    overallOk,
    totalDurationMs: Date.now() - totalStarted,
    timestamp: new Date().toISOString(),
    checks,
    summary: summarize(checks),
  };
}
