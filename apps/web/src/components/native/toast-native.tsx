'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { XCircle, Info, X } from 'lucide-react';
import { BadgeAlertIcon } from 'lucide-animated';
import { MessageCircleCheckIcon } from '../icons/message-circle-check-icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastNativeProps {
  /**
   * Whether the toast is visible
   */
  isOpen: boolean;
  /**
   * Callback when toast should close
   */
  onClose: () => void;
  /**
   * Toast message
   */
  message: string;
  /**
   * Toast type
   * @default 'info'
   */
  type?: ToastType;
  /**
   * Duration in milliseconds before auto-close
   * @default 3000
   */
  duration?: number;
  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Position of the toast
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';
}

const toastIcons = {
  success: MessageCircleCheckIcon,
  error: XCircle,
  warning: BadgeAlertIcon,
  info: Info,
};

const toastStyles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
};

/**
 * Native-style toast notification
 * Appears at the bottom of the screen on mobile
 *
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 *
 * <ToastNative
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 *   message="Success!"
 *   type="success"
 * />
 * ```
 */
export function ToastNative({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 3000,
  showCloseButton = true,
  position = 'bottom',
}: ToastNativeProps) {
  const Icon = toastIcons[type];

  useEffect(() => {
    if (isOpen) {
      // Auto-close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration, onClose]);

  const positionClasses = position === 'top' ? 'top-4 safe-top' : 'bottom-4 safe-bottom';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{
            type: 'spring',
            duration: 0.35,
            bounce: 0.1,
          }}
          className={cn('fixed left-4 right-4 z-200 mx-auto max-w-md', positionClasses)}
        >
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg',
              'backdrop-blur-sm',
              toastStyles[type]
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors touch-target"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
