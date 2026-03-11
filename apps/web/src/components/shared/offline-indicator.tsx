'use client';

import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useTranslations } from 'next-intl';

/**
 * A component that displays an indicator when the user is offline.
 * Shows a banner at the top of the screen with offline status.
 * Automatically dismisses when connection is restored.
 *
 * @example
 * ```tsx
 * <OfflineIndicator />
 * ```
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const t = useTranslations('offline');

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-5 w-5" />
              <span className="font-medium">
                {t('message', { defaultValue: 'No internet connection' })}
              </span>
            </div>
          </div>
        </motion.div>
      )}
      {wasOffline && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <Wifi className="h-5 w-5" />
              <span className="font-medium">
                {t('backOnline', { defaultValue: 'Back online' })}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
