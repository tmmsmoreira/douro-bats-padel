'use client';

import { motion } from 'motion/react';
import { Footer } from '@/components/public/footer';
import { pageTransition } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { SkipLinks } from '@/components/shared/skip-links';
import { useIsFromBfcache } from '@/hooks';

interface PageLayoutProps {
  /**
   * Navigation component to render at the top
   */
  nav: React.ReactNode;
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Maximum width of the content container
   * @default '4xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /**
   * Whether to show the footer
   * @default true
   */
  showFooter?: boolean;
  /**
   * Additional className for the main content area
   */
  className?: string;
  /**
   * Whether to animate the page content on mount
   * @default true
   */
  animate?: boolean;
  /**
   * Custom padding for the main content area
   * If not provided, uses standard responsive padding
   */
  padding?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Standard page layout component that provides consistent structure across the application.
 *
 * Features:
 * - Consistent spacing and responsive behavior
 * - Optional footer
 * - Configurable max-width
 * - Optional page transition animation
 * - Sticky navigation
 *
 * @example
 * ```tsx
 * <PageLayout nav={<AdaptiveNav />}>
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageLayout>
 * ```
 *
 * @example
 * ```tsx
 * <PageLayout nav={<HomeNavClient />} maxWidth="6xl" showFooter={false}>
 *   <ContactForm />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  nav,
  children,
  maxWidth = '4xl',
  showFooter = true,
  className,
  animate = true,
  padding,
}: PageLayoutProps) {
  const isBackNav = useIsFromBfcache();

  const mainContent = (
    <main
      id="main-content"
      className={cn(
        'container mx-auto flex-1 min-h-[500px]',
        // Add horizontal and top padding
        // Bottom padding is handled by page-bottom-padding class (mobile) and md:pb-6/sm:md:pb-8 (desktop)
        padding || 'p-4 sm:p-6 page-bottom-padding md:pb-6 sm:md:pb-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </main>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SkipLinks />
      {nav}
      {/* Add padding-top to account for fixed navbar (4rem height + safe-area-inset + 1px border) */}
      <div style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px) + 1px)' }}>
        {animate && !isBackNav ? (
          <motion.div {...pageTransition} className="flex-1 flex flex-col">
            {mainContent}
          </motion.div>
        ) : (
          mainContent
        )}
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
