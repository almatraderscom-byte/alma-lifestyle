import * as Sentry from '@sentry/nextjs';

export type ReportPayload = {
  error: Error & { digest?: string };
  context?: Record<string, unknown>;
};

export function reportError({ error, context }: ReportPayload): void {
  // eslint-disable-next-line no-console
  console.error('[reportError]', {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    context,
  });

  Sentry.captureException(error, {
    extra: { digest: error.digest, ...context },
  });
}
