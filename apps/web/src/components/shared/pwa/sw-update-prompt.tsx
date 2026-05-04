'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/**
 * Watches the service worker registration for an installed-but-waiting worker
 * and surfaces a toast prompting the user to reload. Clicking the action posts
 * `{type:'SKIP_WAITING'}` to the waiting SW; Serwist's built-in handler calls
 * `skipWaiting()`, which fires `controllerchange` and we reload the page.
 *
 * Required because `skipWaiting: false` in `src/app/sw.ts` — otherwise a new
 * SW would silently take over and the user could lose in-flight state.
 *
 * We also actively poll for updates: browsers only auto-check sw.js on
 * navigation (and even then bounded by HTTP caching), so an installed PWA can
 * sit on the old version across deploys. We call `registration.update()` on
 * mount, on tab focus/visibility, and on a 30-minute interval so a deployed
 * change reliably surfaces the prompt.
 *
 * NOTE: Serwist disables the SW in development (next.config.mjs), so this
 * prompt only fires in production builds.
 */
const UPDATE_POLL_MS = 30 * 60 * 1000;

export function ServiceWorkerUpdatePrompt() {
  const t = useTranslations('swUpdate');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const promptUser = (worker: ServiceWorker) => {
      toast(t('message'), {
        duration: Infinity,
        action: {
          label: t('reload'),
          onClick: () => worker.postMessage({ type: 'SKIP_WAITING' }),
        },
      });
    };

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let onFocus: (() => void) | undefined;
    let onVisibility: (() => void) | undefined;

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        promptUser(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            promptUser(installing);
          }
        });
      });

      const checkForUpdate = () => {
        registration.update().catch(() => {
          // Network errors are expected (offline) — ignore.
        });
      };

      checkForUpdate();
      intervalId = setInterval(checkForUpdate, UPDATE_POLL_MS);

      onFocus = checkForUpdate;
      onVisibility = () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      };
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      if (intervalId) clearInterval(intervalId);
      if (onFocus) window.removeEventListener('focus', onFocus);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [t]);

  return null;
}
