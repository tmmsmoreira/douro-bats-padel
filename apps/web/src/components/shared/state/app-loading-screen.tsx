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
    // Hide the static HTML splash screen now that React has hydrated
    const staticSplash = document.getElementById('static-splash');
    if (staticSplash) staticSplash.style.display = 'none';

    // Mark as hydrated
    setIsHydrated(true);

    if (!isStandalone || hasShownSplash) {
      setIsVisible(false);
      return;
    }

    hasShownSplash = true;

    // Ensure minimum duration is met
    const startTime = Date.now();

    const hideScreen = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setIsVisible(false);
      }, remaining);
    };

    // Wait for both hydration and minimum duration
    hideScreen();
  }, [minDuration, isStandalone]);

  // Lock body scroll when splash screen is visible
  useEffect(() => {
    if (isVisible) {
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll on both html and body elements with !important
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');

      // Add padding to prevent layout shift
      if (scrollbarWidth > 0) {
        document.documentElement.style.setProperty(
          'padding-right',
          `${scrollbarWidth}px`,
          'important'
        );
      }

      // Cleanup: restore original values when splash screen is hidden
      return () => {
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('padding-right');
      };
    }
  }, [isVisible]);

  // Don't render on server
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
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 pointer-events-none"
          />
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative"
            >
              <div className="w-32 h-32 relative">
                <Image
                  src="/icons/logo.png"
                  alt="Douro Bats Padel"
                  width={128}
                  height={128}
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* App Name */}
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-foreground">Douro Bats Padel</h1>
              <p className="text-sm text-muted-foreground mt-1">Loading your experience...</p>
            </motion.div>

            {/* Loading Spinner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
              className="flex gap-2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
