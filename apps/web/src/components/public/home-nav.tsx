'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { MobileMenu } from '@/components/shared/mobile-menu';
import Image from 'next/image';
import { LOGO_BLUR_DATA_URL } from '@/lib/image-blur';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { cn } from '@/lib/utils';

/**
 * Navigation component for unauthenticated users only.
 * Shows public pages and a Sign In button.
 */
export function HomeNav() {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNavVisible = useScrollDirection();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 safe-top transition-transform duration-300',
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <nav id="navigation" aria-label="Main navigation" className="border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 shrink-0">
                <Image
                  src="/icons/logo.png"
                  alt="Douro Bats Padel"
                  width={40}
                  height={40}
                  priority
                  placeholder="blur"
                  blurDataURL={LOGO_BLUR_DATA_URL}
                  className="object-contain"
                />
                <span className="font-heading gradient-text text-xl font-bold">
                  Douro Bats Padel
                </span>
              </Link>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <LanguageToggleButton />
                <ThemeToggleButton />
                <Link href="/login">
                  <Button size="sm">{t('signIn')}</Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <MenuToggle isOpen={mobileMenuOpen} />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Full-Screen Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        session={null}
        navItems={[]}
        t={t}
        showRoleSwitch={false}
        roleSwitchHref="/admin"
        roleSwitchLabel={t('adminView')}
        showAccountSection={false}
        showSignInButton={true}
      />
    </>
  );
}
