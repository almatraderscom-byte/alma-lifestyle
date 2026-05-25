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
  // TODO(OBS-001): forward to Sentry when @sentry/nextjs is integrated.
  // Example shape we will use:
  //   Sentry.captureException(error, { extra: context });
}
