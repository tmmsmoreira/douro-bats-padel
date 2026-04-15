import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.includes('/manifest.json') ||
    pathname.includes('/offline.html')
  ) {
    return NextResponse.next();
  }

  // Step 1: Run next-intl middleware first
  const intlResponse = handleI18nRouting(req);

  // Step 2: If next-intl is redirecting, return that response immediately
  if (!intlResponse.ok) {
    return intlResponse;
  }

  // Step 2.5: Enable back-forward cache (bfcache) by changing Cache-Control header
  // Next.js sends 'private, no-cache, no-store, max-age=0, must-revalidate' by default
  // which prevents bfcache. We change it to allow bfcache while still preventing stale content.
  intlResponse.headers.set('Cache-Control', 'public, no-cache, max-age=0, must-revalidate');

  // Step 3: Get the session for auth checks
  const session = await auth();

  // Extract locale from pathname for auth checks
  const locale = pathname.split('/')[1];
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const isLoggedIn = !!session;

  // Auth pages (login, register, etc.)
  const isAuthPage =
    pathnameWithoutLocale.startsWith('/login') ||
    pathnameWithoutLocale.startsWith('/signup') ||
    pathnameWithoutLocale.startsWith('/register') ||
    pathnameWithoutLocale.startsWith('/forgot-password') ||
    pathnameWithoutLocale.startsWith('/reset-password') ||
    pathnameWithoutLocale.startsWith('/verify-email') ||
    pathnameWithoutLocale.startsWith('/resend-verification');

  // Public pages that don't require authentication
  const isPublicPage =
    pathnameWithoutLocale === '/' ||
    pathnameWithoutLocale === '/about' ||
    pathnameWithoutLocale === '/contact' ||
    pathnameWithoutLocale === '/faq' ||
    pathnameWithoutLocale === '/terms' ||
    pathnameWithoutLocale === '/privacy' ||
    pathnameWithoutLocale === '/cookies';

  // If user is logged in and tries to access auth pages, redirect to home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
    return intlResponse;
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return intlResponse;
  }

  // For all other pages, require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Editor-only pages require EDITOR or ADMIN role
  const isEditorOnlyPage =
    pathnameWithoutLocale === '/players' ||
    pathnameWithoutLocale.startsWith('/venues') ||
    pathnameWithoutLocale === '/events/new' ||
    /^\/events\/[^/]+\/edit$/.test(pathnameWithoutLocale) ||
    /^\/events\/[^/]+\/draw\/generate$/.test(pathnameWithoutLocale);

  if (isEditorOnlyPage) {
    const roles = session?.user?.roles || [];
    const isEditor = roles.includes('EDITOR') || roles.includes('ADMIN');
    if (!isEditor) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     * - offline.html (PWA offline page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|manifest.json|icons|offline.html).*)',
  ],
};
