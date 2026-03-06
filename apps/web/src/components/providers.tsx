'use client';

import type React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import type { Session } from 'next-auth';

/**
 * Component to handle session errors (like token refresh failures)
 * Note: Route protection is handled by middleware (proxy.ts), not here
 */
function SessionErrorHandler({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only handle session errors (e.g., RefreshAccessTokenError)
    // Do NOT handle general authentication - that's the middleware's job
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('Session error detected, signing out and redirecting to login...');
      // Extract locale from pathname
      const locale = pathname.split('/')[1] || 'en';
      signOut({ redirect: false }).then(() => {
        router.push(`/${locale}/login`);
      });
    }
  }, [session, router, pathname]);

  return <>{children}</>;
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 401 Unauthorized errors
              if (error instanceof Error && error.message.includes('Unauthorized')) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry on 401 Unauthorized errors
              if (error instanceof Error && error.message.includes('Unauthorized')) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <SessionErrorHandler>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </SessionErrorHandler>
      </SessionProvider>
    </ThemeProvider>
  );
}
