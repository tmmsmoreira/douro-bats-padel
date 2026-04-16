import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';
import { API_URL } from '@/lib/constants';

/**
 * Hook to get API headers with authentication
 */
export function useApiHeaders() {
  const { data: session } = useSession();

  return useMemo(() => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }, [session?.accessToken]);
}

/**
 * Hook to get authenticated fetch function
 */
export function useAuthFetch() {
  const headers = useApiHeaders();

  return useMemo(
    () => ({
      get: async <T>(path: string): Promise<T> => {
        const res = await fetch(`${API_URL}${path}`, { headers });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }
        return res.json();
      },
      post: async <T>(path: string, data?: unknown): Promise<T> => {
        const res = await fetch(`${API_URL}${path}`, {
          method: 'POST',
          headers,
          body: data ? JSON.stringify(data) : undefined,
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }
        return res.json();
      },
      patch: async <T>(path: string, data?: unknown): Promise<T> => {
        const res = await fetch(`${API_URL}${path}`, {
          method: 'PATCH',
          headers,
          body: data ? JSON.stringify(data) : undefined,
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }
        return res.json();
      },
      delete: async <T>(path: string): Promise<T> => {
        const res = await fetch(`${API_URL}${path}`, {
          method: 'DELETE',
          headers,
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }
        return res.json();
      },
    }),
    [headers]
  );
}

/**
 * Helper to build common onSuccess/onError callbacks for mutations.
 * Reduces boilerplate across mutation hooks.
 */
export function mutationCallbacks(options: {
  queryClient: QueryClient;
  invalidateKeys?: string[][];
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
}) {
  return {
    onSuccess: async () => {
      if (options.invalidateKeys) {
        await Promise.all(
          options.invalidateKeys.map((key) =>
            options.queryClient.invalidateQueries({ queryKey: key })
          )
        );
      }
      toast.success(options.successMessage);
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || options.errorMessage || 'An error occurred');
    },
  };
}
