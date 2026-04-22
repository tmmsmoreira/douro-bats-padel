'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useIsStandalone } from '@/hooks/use-is-standalone';

let hasShownSplash = false;

interface AppLoadingScreenProps {
  /**
   * Minimum duration to show the loading screen in milliseconds
   * @default 1000
   */
  minDuration?: number;
  /**
   * Whether to show the loading screen
   * @default true
   */
  show?: boolean;
}

/**
 * Initial app loading screen that displays while the app is hydrating.
 * Shows a branded loading experience with smooth fade out.
 *
 * The logo is locked to the true geometric center of the viewport at the same
 * 33vmin ratio used by the iOS `apple-touch-startup-image` PNGs (see
 * `scripts/generate-ios-splash.mjs`), so the native splash → React splash
 * handoff does not move the logo. Only the title/dots animate in.
 *
 * @example
 * ```tsx
 * <AppLoadingScreen minDuration={1000} />
 * ```
 */
export function AppLoadingScreen({ minDuration = 1000, show = true }: AppLoadingScreenProps) {
  const isStandalone = useIsStandalone();
  const [isVisible, setIsVisible] = useState(show && !hasShownSplash && isStandalone);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    if (!isStandalone || hasShownSplash) {
      // Hide the static HTML splash even if we skip the React splash,
      // otherwise it would stay on top of the app in non-standalone contexts
      // (it's CSS-gated, but defense in depth).
      const staticSplash = document.getElementById('static-splash');
      if (staticSplash) staticSplash.style.display = 'none';
      setIsVisible(false);
      return;
    }

    hasShownSplash = true;

    // React splash is now on screen with the same logo in the same position
    // as the static splash. Hide the static one so it doesn't re-appear when
    // the React splash fades out.
    const staticSplash = document.getElementById('static-splash');
    if (staticSplash) staticSplash.style.display = 'none';

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, minDuration);

    return () => clearTimeout(timeout);
  }, [minDuration, isStandalone]);

  useEffect(() => {
    if (isVisible) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');

      if (scrollbarWidth > 0) {
        document.documentElement.style.setProperty(
          'padding-right',
          `${scrollbarWidth}px`,
          'important'
        );
      }

      return () => {
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('padding-right');
      };
    }
  }, [isVisible]);

  if (!isHydrated && !show) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-9999 bg-background"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 pointer-events-none"
          />

          {/* Logo: geometrically centered, matching iOS native splash position + size exactly */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: '33vmin', height: '33vmin' }}
          >
            <Image
              src="/icons/logo.png"
              alt="Douro Bats Padel"
              fill
              priority
              sizes="33vmin"
              className="object-contain"
            />
          </div>

          {/* Text + dots: positioned below the logo without shifting it */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 text-center"
            style={{ top: 'calc(50% + 33vmin / 2 + 1.5rem)' }}
          >
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              <h1 className="text-2xl font-bold text-foreground">Douro Bats Padel</h1>
              <p className="text-sm text-muted-foreground mt-1">Loading your experience...</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
              className="flex gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
