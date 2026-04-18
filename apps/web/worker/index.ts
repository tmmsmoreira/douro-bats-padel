/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event) => {
  if (!event.data) return;

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

  event.waitUntil(self.registration.showNotification(payload.title, options));
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
