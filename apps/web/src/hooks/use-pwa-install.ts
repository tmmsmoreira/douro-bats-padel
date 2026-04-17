'use client';

import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PWAPlatform =
  | 'chromium-desktop'
  | 'chromium-android'
  | 'safari-ios'
  | 'safari-macos'
  | 'arc'
  | 'firefox'
  | 'ios-other'
  | 'unsupported';

function detectPlatform(): PWAPlatform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unsupported';
  }

  const ua = navigator.userAgent;
  const isIPad =
    /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIOS = /iPhone|iPod/.test(ua) || isIPad;
  const isAndroid = /Android/.test(ua);
  const isMac = /Macintosh/.test(ua) && !isIPad;
  const isFirefox = /Firefox/.test(ua);
  // Arc exposes a CSS custom property on the root element
  const isArc =
    typeof getComputedStyle === 'function' &&
    getComputedStyle(document.documentElement).getPropertyValue('--arc-palette-title').trim() !==
      '';
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);

  if (isIOS) {
    return isSafari ? 'safari-ios' : 'ios-other';
  }
  if (isArc) return 'arc';
  if (isFirefox) return 'firefox';
  if (isMac && isSafari) return 'safari-macos';
  if (isAndroid) return 'chromium-android';
  return 'chromium-desktop';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PWAPlatform>('unsupported');

  useEffect(() => {
    setPlatform(detectPlatform());

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari exposes this non-standard flag when launched from the home screen
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const canPromptInstall = deferredPrompt !== null;

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const needsManualInstructions = useMemo(
    () => !isInstalled && !canPromptInstall,
    [isInstalled, canPromptInstall]
  );

  return {
    /** True when the browser-native install prompt is available */
    canPromptInstall,
    /** True when the app is running standalone (already installed) */
    isInstalled,
    /** True when we should show a manual instructions modal instead */
    needsManualInstructions,
    /** The detected browser/platform for choosing instructions */
    platform,
    /** Trigger the native install prompt (no-op when not available) */
    installApp,
  };
}
