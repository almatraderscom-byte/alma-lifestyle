import * as Sentry from '@sentry/nextjs';
import { sentryBeforeSend } from './sentry.before-send';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled:
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
    process.env.VERCEL_ENV === 'production',
  environment: process.env.VERCEL_ENV ?? 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  beforeSend: sentryBeforeSend,
});
