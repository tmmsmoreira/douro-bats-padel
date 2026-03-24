'use client';

import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { slideUp } from '@/lib/animations';
import { useLocale } from 'next-intl';

interface AuthPageLayoutProps {
  /**
   * The form component to render on the right side
   */
  children: React.ReactNode;
  /**
   * Image URL for the left side
   * @default 'https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070'
   */
  imageUrl?: string;
  /**
   * Alt text for the image
   * @default 'Padel court'
   */
  imageAlt?: string;
  /**
   * Title to display on the image side
   * @default 'Douro Bats Padel'
   */
  title?: string;
  /**
   * Subtitle to display on the image side
   */
  subtitle?: string;
  /**
   * Bottom card title on the image side
   */
  bottomTitle?: string;
  /**
   * Bottom card description on the image side
   */
  bottomDescription?: string;
  /**
   * Whether to use the fancy gradient effect for the title
   * @default false
   */
  fancyTitle?: boolean;
  /**
   * Whether to animate the form on mount
   * @default true
   */
  animate?: boolean;
}

/**
 * Layout component for authentication pages with split design.
 * Left side shows an image with branding, right side shows the form.
 *
 * Features:
 * - Responsive (image hidden on mobile)
 * - Theme and language toggles in top-right
 * - Consistent branding
 * - Optional animations
 *
 * @example
 * ```tsx
 * <AuthPageLayout
 *   subtitle="Manage your padel game nights with ease"
 *   bottomTitle="Organize & Play"
 *   bottomDescription="Track your games"
 * >
 *   <LoginForm />
 * </AuthPageLayout>
 * ```
 */
export function AuthPageLayout({
  children,
  imageUrl = 'https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070',
  imageAlt = 'Padel court',
  title = 'Douro Bats Padel',
  subtitle,
  bottomTitle,
  bottomDescription,
  fancyTitle = false,
  animate = true,
}: AuthPageLayoutProps) {
  const locale = useLocale();
  const formContent = (
    <div className="flex-1 flex items-center justify-center bg-background p-8">{children}</div>
  );

  return (
    <div className="min-h-screen flex relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>

      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-900 via-secondary/80 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        <Image src={imageUrl} alt={imageAlt} fill className="object-cover opacity-80" priority />
        <div className="relative z-10 flex flex-col justify-between text-white p-12">
          {/* Top section - Title */}
          <div className="relative">
            {fancyTitle ? (
              <Link href={`/${locale}`} className="relative inline-block group">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30 blur-2xl -z-10 group-hover:blur-3xl transition-all" />
                {/* Glass container */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl group-hover:border-white/30 transition-all">
                  <h1 className="text-4xl font-bold mb-2 font-heading gradient-text">{title}</h1>
                  {subtitle && <p className="text-lg text-white/90">{subtitle}</p>}
                </div>
              </Link>
            ) : (
              <Link href={`/${locale}`} className="inline-block group">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 group-hover:border-white/30 transition-all">
                  <h1 className="text-4xl font-bold mb-2 font-heading gradient-text">{title}</h1>
                  {subtitle && <p className="text-lg text-white/90">{subtitle}</p>}
                </div>
              </Link>
            )}
          </div>

          {/* Bottom section - Call to action */}
          {(bottomTitle || bottomDescription) && (
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                {bottomDescription && (
                  <p className="text-sm text-white/80 mb-1">{bottomDescription}</p>
                )}
                {bottomTitle && <p className="text-2xl font-semibold">{bottomTitle}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Form */}
      {animate ? (
        <motion.div
          {...slideUp}
          className="flex-1 flex items-center justify-center bg-background p-8"
        >
          {children}
        </motion.div>
      ) : (
        formContent
      )}
    </div>
  );
}
