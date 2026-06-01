import type { ErrorEvent } from '@sentry/nextjs';

/** Strip cookies and auth headers before events leave the app (OBS-001). */
export function sentryBeforeSend(event: ErrorEvent): ErrorEvent {
  if (event.request?.cookies) {
    event.request.cookies = { __redacted: 'true' };
  }
  if (event.request?.headers) {
    delete event.request.headers.cookie;
    delete event.request.headers.authorization;
  }
  return event;
}
