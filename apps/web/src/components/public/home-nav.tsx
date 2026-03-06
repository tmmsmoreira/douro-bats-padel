'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useActivePathname } from '@/hooks/use-active-pathname';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { MobileMenu } from '@/components/shared/mobile-menu';

/**
 * Navigation component for unauthenticated users only.
 * Shows public pages and a Sign In button.
 */
export function HomeNav() {
  const pathname = useActivePathname();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { href: `/`, label: t('events') },
    { href: `/leaderboard`, label: t('ranking') },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="font-heading gradient-text text-xl font-bold shrink-0">
                Douro Bats Padel
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden flex-1 md:flex items-center justify-between">
                <div className="flex flex-1 gap-2 justify-center px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-[999px] transition-colors',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-muted-foreground/60'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <LanguageToggleButton />
                  <ThemeToggleButton />
                  <Link href="/login">
                    <Button size="sm">{t('signIn')}</Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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
        navItems={navItems}
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
