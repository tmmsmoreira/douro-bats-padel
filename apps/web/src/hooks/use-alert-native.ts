'use client';

import { useState, useCallback } from 'react';
import type { AlertAction } from '@/components/ui/alert-native';

export interface AlertState {
  isOpen: boolean;
  title: string;
  message?: string;
  actions: AlertAction[];
  variant?: 'ios' | 'android';
}

const initialState: AlertState = {
  isOpen: false,
  title: '',
  message: undefined,
  actions: [],
  variant: 'ios',
};

export interface ShowAlertOptions {
  title: string;
  message?: string;
  actions: AlertAction[];
  variant?: 'ios' | 'android';
}

/**
 * Hook for managing native-style alerts
 *
 * @example
 * ```tsx
 * const { alertState, showAlert, closeAlert } = useAlertNative();
 *
 * <button onClick={() => showAlert({
 *   title: 'Delete Item?',
 *   message: 'This cannot be undone.',
 *   actions: [
 *     { label: 'Cancel', onClick: closeAlert },
 *     { label: 'Delete', onClick: handleDelete, destructive: true },
 *   ],
 * })}>
 *   Delete
 * </button>
 *
 * <AlertNative
 *   isOpen={alertState.isOpen}
 *   onClose={closeAlert}
 *   title={alertState.title}
 *   message={alertState.message}
 *   actions={alertState.actions}
 *   variant={alertState.variant}
 * />
 * ```
 */
export function useAlertNative() {
  const [alertState, setAlertState] = useState<AlertState>(initialState);

  const showAlert = useCallback((options: ShowAlertOptions) => {
    setAlertState({
      isOpen: true,
      title: options.title,
      message: options.message,
      actions: options.actions,
      variant: options.variant || 'ios',
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(initialState);
  }, []);

  // Convenience methods for common alert types
  const confirm = useCallback(
    (options: {
      title: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm: () => void;
      onCancel?: () => void;
      destructive?: boolean;
      variant?: 'ios' | 'android';
    }) => {
      showAlert({
        title: options.title,
        message: options.message,
        variant: options.variant,
        actions: [
          {
            label: options.cancelLabel || 'Cancel',
            onClick: () => {
              options.onCancel?.();
              closeAlert();
            },
          },
          {
            label: options.confirmLabel || 'Confirm',
            onClick: () => {
              options.onConfirm();
              closeAlert();
            },
            destructive: options.destructive,
            preferred: true,
          },
        ],
      });
    },
    [showAlert, closeAlert]
  );

  const alert = useCallback(
    (options: {
      title: string;
      message?: string;
      buttonLabel?: string;
      onClose?: () => void;
      variant?: 'ios' | 'android';
    }) => {
      showAlert({
        title: options.title,
        message: options.message,
        variant: options.variant,
        actions: [
          {
            label: options.buttonLabel || 'OK',
            onClick: () => {
              options.onClose?.();
              closeAlert();
            },
            preferred: true,
          },
        ],
      });
    },
    [showAlert, closeAlert]
  );

  return {
    alertState,
    showAlert,
    closeAlert,
    confirm,
    alert,
  };
}
