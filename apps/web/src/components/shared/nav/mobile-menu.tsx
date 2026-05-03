'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from '@/components/shared/player';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Session } from 'next-auth';
import { LogoutIcon, UserIcon } from 'lucide-animated';
import { signOut } from 'next-auth/react';
import { ThemeToggleGroup } from '@/components/shared/theme/theme-toggle-button';
import { LanguageToggleGroup } from '@/components/shared/language/language-toggle-button';
import { useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  navItems: NavItem[];
  t: (key: string) => string;
  showAccountSection?: boolean;
  showSignInButton?: boolean;
}

export function MobileMenu({
  isOpen,
  onClose,
  session,
  t,
  showAccountSection = true,
  showSignInButton = false,
}: MobileMenuProps) {
  // Prevent pull-to-refresh when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overscrollBehavior = 'none';

      return () => {
        document.body.style.overscrollBehavior = '';
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Menu content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed inset-0 top-16 z-100"
            style={{
              top: 'calc(4rem + env(safe-area-inset-top, 0px) + 1px)',
              overscrollBehavior: 'contain',
            }}
          >
            <nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="h-full w-full bg-card"
              style={{
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
              }}
            >
              <ScrollArea className="h-full w-full">
                <div
                  className="container mx-auto px-4 py-6 space-y-2"
                  style={{
                    paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                  }}
                >
                  {/* Sign In Section - First for non-authenticated users */}
                  {!session && showSignInButton && (
                    <div className="pb-2">
                      <Link href="/login" onClick={onClose}>
                        <Button className="w-full" size="lg">
                          {t('signIn')}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* User Profile Section */}
                  {session && (
                    <div className="flex items-center gap-4 pb-2">
                      <PlayerAvatar
                        name={session?.user?.name}
                        email={session?.user?.email}
                        profilePhoto={session?.user?.profilePhoto}
                        size="xl"
                        className="h-16 w-16 sm:h-16 sm:w-16 text-xl"
                        alt={session?.user?.name || 'User'}
                      />
                      <div className="flex-1 min-w-0">
                        {session?.user?.name && (
                          <p className="font-semibold text-lg truncate">{session.user.name}</p>
                        )}
                        {session?.user?.email && (
                          <p className="text-sm text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation items moved to TabBar at the bottom of the screen */}

                  {/* Account Section */}
                  {session && showAccountSection && (
                    <div className="space-y-1 pt-2 border-t">
                      <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('account') || 'Account'}
                      </p>
                      <Link
                        href="/profile"
                        onClick={() => {
                          onClose();
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                      >
                        <UserIcon size={20} className="h-5 w-5" />
                        {t('profile')}
                      </Link>
                    </div>
                  )}

                  {/* Settings Section */}
                  <div className="space-y-1 pt-2 border-t">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('settings') || 'Settings'}
                    </p>

                    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg">
                      <span className="text-base font-medium">{t('language') || 'Language'}</span>
                      <div className="ml-auto">
                        <LanguageToggleGroup />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg">
                      <span className="text-base font-medium">{t('theme') || 'Theme'}</span>
                      <div className="ml-auto">
                        <ThemeToggleGroup />
                      </div>
                    </div>
                  </div>

                  {/* LEGAL Section */}
                  <div className="space-y-1 pt-2 border-t">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Legal
                    </p>
                    <Link
                      href="/terms"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      Termos e Condições
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      Política de Privacidade
                    </Link>
                    <Link
                      href="/cookies"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      Política de Cookies
                    </Link>
                  </div>

                  {/* INFORMAÇÃO Section */}
                  <div className="space-y-1 pt-2 border-t">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Informação
                    </p>
                    <Link
                      href="/about"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      {t('about') || 'Sobre Nós'}
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      {t('contact') || 'Contacto'}
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => {
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                    >
                      {t('faq') || 'FAQ'}
                    </Link>
                  </div>

                  {/* Sign Out Section */}
                  {session && (
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => {
                          onClose();
                          signOut();
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10 active:bg-destructive/20 w-full touch-target no-tap-highlight"
                      >
                        <LogoutIcon size={20} />
                        {t('signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
