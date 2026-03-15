'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ui/toast-native';

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastOptions {
  duration?: number;
}

/**
 * Hook for managing native-style toasts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toast, ToastComponent } = useToastNative();
 *
 *   return (
 *     <>
 *       <button onClick={() => toast.success('Saved!')}>
 *         Save
 *       </button>
 *       {ToastComponent}
 *     </>
 *   );
 * }
 * ```
 */
export function useToastNative() {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType, options?: ToastOptions) => {
    setToastState({
      isOpen: true,
      message,
      type,
      duration: options?.duration,
    });
  }, []);

  const toast = {
    success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
    error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
    warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
    info: (message: string, options?: ToastOptions) => showToast(message, 'info', options),
  };

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toast,
    toastState,
    closeToast,
  };
}
