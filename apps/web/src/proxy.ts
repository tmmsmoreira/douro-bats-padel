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

  // Step 2.5: Enable back-forward cache (bfcache) by changing Cache-Control header.
  // Next.js sends 'private, no-cache, no-store, max-age=0, must-revalidate' by default
  // which prevents bfcache. Dropping `no-store` re-enables bfcache, but we keep
  // `private` so shared caches (CDN, corporate proxy) do not store authenticated HTML.
  intlResponse.headers.set('Cache-Control', 'private, no-cache, max-age=0, must-revalidate');

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

  // If user is logged in and tries to access auth pages, redirect to events
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}/events`, req.url));
    }
    return intlResponse;
  }

  // Logged-in users see Events as the default landing page instead of the marketing home
  if (isLoggedIn && pathnameWithoutLocale === '/') {
    return NextResponse.redirect(new URL(`/${locale}/events`, req.url));
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return intlResponse;
  }

  // For all other pages, require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Admin-only pages (historically "editor" pages; the EDITOR role was merged
  // into ADMIN). The page-level EditorGuard still does the hard 404; this
  // check exists so the middleware can short-circuit when a guard exists.
  const isAdminOnlyPage =
    pathnameWithoutLocale === '/players' ||
    pathnameWithoutLocale.startsWith('/venues') ||
    pathnameWithoutLocale === '/events/new' ||
    /^\/events\/[^/]+\/edit$/.test(pathnameWithoutLocale) ||
    /^\/events\/[^/]+\/draw\/generate$/.test(pathnameWithoutLocale);

  if (isAdminOnlyPage) {
    const roles = session?.user?.roles || [];
    const isAdmin = roles.includes('ADMIN');
    if (!isAdmin) {
      // Let the page render — EditorGuard will call notFound()
      return intlResponse;
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
