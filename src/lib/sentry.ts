import * as Sentry from '@sentry/react';

const SENTRY_DSN =
  'https://292823f359c6dfe4ca76b296598ad283@o4511291987394560.ingest.us.sentry.io/4511291994275840';

// Errors we don't want to clutter Sentry with
const IGNORED_ERROR_PATTERNS = [
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /Network request failed/i,
  /Failed to fetch/i,
  /Load failed/i,
  /AbortError/i,
  /The play\(\) request was interrupted/i,
  /The operation was aborted/i,
  /cancelled/i,
  /Extension context invalidated/i,
];

export function initSentry() {
  if (typeof window === 'undefined') return;

  // Skip in local dev to avoid noise
  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: isLocalDev ? 'development' : 'production',
    enabled: !isLocalDev,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
    ],
    // Performance: sample 10% of transactions
    tracesSampleRate: 0.1,
    // Session replay: 10% of normal sessions, 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Filter noise
    ignoreErrors: IGNORED_ERROR_PATTERNS,
    beforeSend(event, hint) {
      const err = hint.originalException as { message?: string } | undefined;
      const msg = err?.message || event.message || '';
      if (IGNORED_ERROR_PATTERNS.some((re) => re.test(msg))) return null;
      return event;
    },
  });
}

export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });
}

export { Sentry };
