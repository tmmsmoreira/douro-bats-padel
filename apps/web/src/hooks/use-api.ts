import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
