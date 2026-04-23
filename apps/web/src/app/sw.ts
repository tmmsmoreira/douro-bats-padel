/// <reference lib="webworker" />
/// <reference types="@serwist/next/typings" />
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, Serwist, StaleWhileRevalidate } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // skipWaiting must stay false: we explicitly prompt the user to reload via
  // <ServiceWorkerUpdatePrompt>, which posts {type:'SKIP_WAITING'} back here.
  // Serwist's built-in message handler responds to that exact payload — no
  // custom handler needed.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.origin === 'https://fonts.gstatic.com',
      handler: new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 365 * DAY })],
      }),
    },
    {
      matcher: ({ url }) => url.origin === 'https://fonts.googleapis.com',
      handler: new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 7 * DAY })],
      }),
    },
    {
      matcher: ({ url }) => /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 7 * DAY })],
      }),
    },
    {
      matcher: ({ url }) => /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: DAY })],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/image'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: DAY })],
      }),
    },
    {
      matcher: ({ url }) => /\.js$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: DAY })],
      }),
    },
    {
      matcher: ({ url }) => /\.(?:css|less)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: DAY })],
      }),
    },
    {
      matcher: ({ url }) => /\/_next\/data\/.+\/.+\.json$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: DAY })],
      }),
    },
    // NOTE: we intentionally do NOT cache /api/* or provide a catch-all.
    // The backend API is on a different origin (NEXT_PUBLIC_API_URL), so any
    // same-origin /api/* routes are NextAuth callbacks that must never be
    // cached. For authenticated HTML pages we rely on the offline document
    // fallback rather than a catch-all NetworkFirst — otherwise cached pages
    // can leak the previous user's data after logout.
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();

const log = (...args: unknown[]) => console.log('[SW]', ...args);

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
  } as NotificationOptions;

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
