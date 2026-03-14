import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UseFormMutationOptions<TData, TResponse = unknown> {
  /**
   * The API endpoint path (e.g., '/events' or '/venues')
   */
  endpoint: string;

  /**
   * HTTP method to use. Defaults to 'POST' for create, 'PATCH' for update
   */
  method?: 'POST' | 'PATCH' | 'PUT';

  /**
   * Query keys to invalidate on success
   */
  invalidateKeys?: string[][];

  /**
   * Success message to show in toast
   */
  successMessage?: string;

  /**
   * Error message prefix to show in toast
   */
  errorMessage?: string;

  /**
   * Path to redirect to on success
   */
  redirectPath?: string;

  /**
   * Custom success callback
   */
  onSuccess?: (data: TResponse) => void;

  /**
   * Custom error callback
   */
  onError?: (error: Error) => void;

  /**
   * Whether to show toast notifications (default: true)
   */
  showToast?: boolean;
}

/**
 * Standardized hook for form mutations (create/update operations)
 *
 * @example
 * ```tsx
 * const createMutation = useFormMutation({
 *   endpoint: '/events',
 *   method: 'POST',
 *   invalidateKeys: [['admin-events']],
 *   successMessage: 'Event created successfully',
 *   redirectPath: '/admin/events',
 * });
 *
 * const updateMutation = useFormMutation({
 *   endpoint: `/events/${eventId}`,
 *   method: 'PATCH',
 *   invalidateKeys: [['admin-events'], ['event', eventId]],
 *   successMessage: 'Event updated successfully',
 *   redirectPath: `/admin/events/${eventId}`,
 * });
 * ```
 */
export function useFormMutation<TData = unknown, TResponse = unknown>({
  endpoint,
  method = 'POST',
  invalidateKeys = [],
  successMessage,
  errorMessage,
  redirectPath,
  onSuccess: customOnSuccess,
  onError: customOnError,
  showToast = true,
}: UseFormMutationOptions<TData, TResponse>) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TData) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json() as Promise<TResponse>;
    },
    onSuccess: (data) => {
      // Invalidate queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Show success toast
      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      // Custom success callback
      if (customOnSuccess) {
        customOnSuccess(data);
      }

      // Redirect if path provided
      if (redirectPath) {
        router.push(redirectPath);
      }
    },
    onError: (error: Error) => {
      // Show error toast
      if (showToast) {
        const message = errorMessage ? `${errorMessage}: ${error.message}` : error.message;
        toast.error(message);
      }

      // Custom error callback
      if (customOnError) {
        customOnError(error);
      }
    },
  });
}
