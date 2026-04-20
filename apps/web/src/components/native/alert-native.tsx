'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface AlertAction {
  /**
   * Label for the action button
   */
  label: string;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * Whether this is a destructive action (red)
   */
  destructive?: boolean;
  /**
   * Whether this is the preferred/default action (bold)
   */
  preferred?: boolean;
}

export interface AlertNativeProps {
  /**
   * Whether the alert is open
   */
  isOpen: boolean;
  /**
   * Callback when alert should close
   */
  onClose: () => void;
  /**
   * Alert title
   */
  title: string;
  /**
   * Alert message/description
   */
  message?: string;
  /**
   * Alert actions/buttons
   */
  actions: AlertAction[];
  /**
   * Alert variant style
   * @default 'ios'
   */
  variant?: 'ios' | 'android';
  /**
   * Whether clicking backdrop closes the alert
   * @default false
   */
  closeOnBackdropClick?: boolean;
}

/**
 * Native-style Alert Dialog component
 * iOS/Android style alert dialogs
 *
 * @example
 * ```tsx
 * <AlertNative
 *   isOpen={showAlert}
 *   onClose={() => setShowAlert(false)}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   actions={[
 *     { label: 'Cancel', onClick: () => setShowAlert(false) },
 *     { label: 'Delete', onClick: handleDelete, destructive: true, preferred: true },
 *   ]}
 * />
 * ```
 */
export function AlertNative({
  isOpen,
  onClose,
  title,
  message,
  actions,
  variant = 'ios',
  closeOnBackdropClick = false,
}: AlertNativeProps) {
  const handleActionClick = React.useCallback((action: AlertAction) => {
    action.onClick();
  }, []);

  const isIOS = variant === 'ios';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-100"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Alert Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101',
              'w-[calc(100%-2rem)] max-w-[320px]',
              'bg-card shadow-2xl',
              isIOS ? 'rounded-2xl' : 'rounded-lg'
            )}
            role="alertdialog"
            aria-labelledby="alert-title"
            aria-describedby={message ? 'alert-message' : undefined}
          >
            {/* Content */}
            <div className={cn('px-6 py-5 text-center', isIOS ? 'pb-4' : 'pb-5')}>
              <h2
                id="alert-title"
                className={cn('text-foreground font-semibold', isIOS ? 'text-lg' : 'text-xl')}
              >
                {title}
              </h2>
              {message && (
                <p
                  id="alert-message"
                  className={cn('text-muted-foreground mt-2', isIOS ? 'text-sm' : 'text-base')}
                >
                  {message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              className={cn(
                isIOS ? 'border-t border-border flex' : 'px-6 pb-5 flex gap-2 justify-end'
              )}
            >
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'touch-target no-tap-highlight transition-colors',
                      'active:scale-[0.98]',
                      isIOS
                        ? cn(
                            'flex-1 py-3 text-base font-medium',
                            index > 0 && 'border-l border-border',
                            action.destructive && 'text-destructive',
                            action.preferred && 'font-semibold',
                            !action.destructive && !action.preferred && 'text-primary',
                            'hover:bg-accent/50 active:bg-accent'
                          )
                        : cn(
                            'px-4 py-2 rounded-md text-sm font-medium',
                            action.destructive
                              ? 'text-destructive hover:bg-destructive/10 active:bg-destructive/20'
                              : action.preferred
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'text-primary hover:bg-accent active:bg-accent/80'
                          )
                    )}
                  >
                    {action.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
