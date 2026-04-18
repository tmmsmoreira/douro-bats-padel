/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Lightweight lifecycle logging. Helps debug stuck SW registrations in prod
// (DevTools → Application → Service Workers) without adding a logging SDK.
// Kept behind a `[SW]` prefix so grep/filter works.
const log = (...args: unknown[]) => console.log('[SW]', ...args);

self.addEventListener('install', () => {
  log('install');
});

self.addEventListener('activate', (event) => {
  log('activate');
  // Claim open clients so the new worker takes over them as soon as the
  // user reloads (after confirming via the SW update prompt).
  event.waitUntil(self.clients.claim());
});

// Client-triggered skip-waiting. We don't call skipWaiting() in the install
// event because that would silently replace the running worker under the user
// (losing in-flight mutations). Instead we wait for the client to confirm via
// a postMessage after the UI prompts the user to reload.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    log('SKIP_WAITING received — activating new worker');
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    log('push received without data — ignoring');
    return;
  }

  const payload = event.data.json();

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    data: {
      url: payload.url || '/',
    },
    tag: payload.tag,
    renotify: !!payload.tag,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options).catch((err) => {
      log('showNotification failed:', err);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            (client as WindowClient).navigate(url);
          }
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
