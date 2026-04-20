'use client';

import { useTranslations } from 'next-intl';

/**
 * Skip links component for accessibility.
 * Provides keyboard users with quick navigation to main content and navigation.
 *
 * The links are visually hidden but become visible when focused with keyboard.
 * This is a WCAG 2.2 Level AA requirement for bypass blocks.
 *
 * @example
 * ```tsx
 * <SkipLinks />
 * ```
 */
export function SkipLinks() {
  const t = useTranslations('accessibility');

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t('skipToMainContent') || 'Skip to main content'}
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-40 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t('skipToNavigation') || 'Skip to navigation'}
      </a>
    </div>
  );
}
