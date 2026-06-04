export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvOrThrow } = await import('./lib/env');
    validateEnvOrThrow();

    // OBS-001: load Sentry after @sentry/nextjs is installed:
    // await import('../sentry.server.config');
  }

  // OBS-001: await import('../sentry.edge.config');
}
