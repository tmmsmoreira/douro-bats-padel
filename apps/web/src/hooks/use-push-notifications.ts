'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthFetch } from './use-api';
import { useSession } from 'next-auth/react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

// iOS Safari only exposes Web Push when the site is launched as an installed
// PWA (standalone display). We detect that combo so the UI can show a
// "install to enable notifications" hint instead of a dead toggle.
function isIOSInBrowserTab(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
  if (!isIOS) return false;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return !standalone;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [requiresInstall, setRequiresInstall] = useState(false);
  const authFetch = useAuthFetch();
  const { data: session } = useSession();

  useEffect(() => {
    const checkSupport = async () => {
      const hasApis =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      const iosNeedsInstall = isIOSInBrowserTab();
      const supported = hasApis && !iosNeedsInstall;

      setIsSupported(supported);
      setRequiresInstall(iosNeedsInstall);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      setPermission(Notification.permission);

      if (Notification.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch {
          setIsSubscribed(false);
        }
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !session?.accessToken) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      const json = subscription.toJSON();

      await authFetch.post('/push/subscribe', {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [isSupported, session?.accessToken, authFetch]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !session?.accessToken) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await authFetch.post('/push/unsubscribe', { endpoint });
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [isSupported, session?.accessToken, authFetch]);

  return {
    isSupported,
    requiresInstall,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
