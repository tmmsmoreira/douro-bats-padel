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
 */
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
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [t]);

  return null;
}
