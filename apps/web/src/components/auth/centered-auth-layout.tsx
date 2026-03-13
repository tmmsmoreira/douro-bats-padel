'use client';

import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { motion } from 'motion/react';
import { fadeInScale } from '@/lib/animations';

interface CenteredAuthLayoutProps {
  /**
   * The form component to render
   */
  children: React.ReactNode;
  /**
   * Whether to animate the form on mount
   * @default true
   */
  animate?: boolean;
}

/**
 * Centered layout component for simple authentication pages.
 * Used for forgot password, reset password, verify email, etc.
 *
 * Features:
 * - Centered content
 * - Theme and language toggles in top-right
 * - Optional fade-in animation
 * - Minimal design
 *
 * @example
 * ```tsx
 * <CenteredAuthLayout>
 *   <ForgotPasswordForm />
 * </CenteredAuthLayout>
 * ```
 */
export function CenteredAuthLayout({ children, animate = true }: CenteredAuthLayoutProps) {
  const content = (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>

      {children}
    </div>
  );

  if (animate) {
    return <motion.div {...fadeInScale}>{content}</motion.div>;
  }

  return content;
}
