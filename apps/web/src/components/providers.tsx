'use client';

import type React from 'react';

// Suppress React 19 warning caused by next-themes rendering an inline <script> to
// prevent theme flash. React 19 no longer executes scripts inside components and warns
// about them. This is a known upstream incompatibility — the warning is harmless because
// next-themes' script only needs to run during SSR (before hydration).
// Remove this once next-themes ships a fix using <template> instead of <script>.
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const _consoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return;
    _consoleError(...args);
  };
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import { TooltipProvider } from './ui/tooltip';
import { useIsMobile } from '@/hooks/use-media-query';
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
  const isRestoredFromBfcache = useRef(false);
  const isMobile = useIsMobile();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: (query) => {
              // Don't refetch on mount if page was restored from bfcache
              if (isRestoredFromBfcache.current) {
                return false;
              }
              // Default behavior: refetch if data is stale
              return query.state.dataUpdatedAt === 0;
            },
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

  // Detect bfcache restoration
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        isRestoredFromBfcache.current = true;
        // Reset the flag after a short delay
        setTimeout(() => {
          isRestoredFromBfcache.current = false;
        }, 100);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <SessionErrorHandler>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {children}
              <Toaster richColors position={isMobile ? 'bottom-center' : 'top-right'} />
            </TooltipProvider>
          </QueryClientProvider>
        </SessionErrorHandler>
      </SessionProvider>
    </ThemeProvider>
  );
}
