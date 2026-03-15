'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useActivePathname } from '@/hooks/use-active-pathname';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Session } from 'next-auth';
import { LogoutIcon, UserIcon } from 'lucide-animated';
import { signOut } from 'next-auth/react';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { useHaptic } from '@/hooks/use-haptic';
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
  showRoleSwitch?: boolean;
  roleSwitchHref?: string;
  roleSwitchLabel?: string;
  showAccountSection?: boolean;
  showSignInButton?: boolean;
}

export function MobileMenu({
  isOpen,
  onClose,
  session,
  navItems,
  t,
  showRoleSwitch = false,
  roleSwitchHref,
  roleSwitchLabel,
  showAccountSection = true,
  showSignInButton = false,
}: MobileMenuProps) {
  const pathname = useActivePathname();
  const haptic = useHaptic();

  // Trigger haptic feedback when menu opens
  useEffect(() => {
    if (isOpen) {
      haptic.light();
    }
  }, [isOpen, haptic]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Menu content */}
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed inset-0 top-16 bg-card z-100 overflow-y-auto safe-bottom"
            style={{
              top: 'calc(4rem + max(1rem, env(safe-area-inset-top)))',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
          >
            <div className="container mx-auto px-4 py-6 space-y-2 pb-safe">
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
                <div className="flex items-center gap-4 pb-6 border-b">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={session?.user?.profilePhoto || undefined}
                      alt={session?.user?.name || 'User'}
                    />
                    <AvatarFallback className="gradient-primary text-xl">
                      {session?.user?.name
                        ? session.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : session?.user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {session?.user?.name && (
                      <p className="font-semibold text-lg truncate">{session.user.name}</p>
                    )}
                    {session?.user?.email && (
                      <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Section */}
              {navItems.length > 0 && (
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        haptic.selection();
                        onClose();
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors touch-target no-tap-highlight',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary active:bg-secondary/80'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Account Section */}
              {session && showAccountSection && (
                <div className="space-y-1 pt-2 border-t">
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('account') || 'Account'}
                  </p>
                  <Link
                    href="/profile"
                    onClick={() => {
                      haptic.selection();
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
                <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg hover:bg-secondary">
                  <span className="text-base font-medium">{t('language') || 'Language'}</span>
                  <div className="ml-auto">
                    <LanguageToggleButton />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg hover:bg-secondary">
                  <span className="text-base font-medium">{t('theme') || 'Theme'}</span>
                  <div className="ml-auto">
                    <ThemeToggleButton />
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
                    haptic.selection();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                >
                  Termos e Condições
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => {
                    haptic.selection();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                >
                  Política de Privacidade
                </Link>
                <Link
                  href="/cookies"
                  onClick={() => {
                    haptic.selection();
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
                    haptic.selection();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                >
                  {t('about') || 'Sobre Nós'}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => {
                    haptic.selection();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary active:bg-secondary/80 touch-target no-tap-highlight"
                >
                  {t('contact') || 'Contacto'}
                </Link>
                <Link
                  href="/faq"
                  onClick={() => {
                    haptic.selection();
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
                      haptic.warning();
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

              {/* Role Switching Section */}
              {showRoleSwitch && roleSwitchHref && roleSwitchLabel && (
                <div className="pt-2 border-t">
                  <Link
                    href={roleSwitchHref}
                    onClick={() => {
                      // Set the view in sessionStorage when switching
                      const targetView = roleSwitchHref.startsWith('/admin') ? 'admin' : 'player';
                      sessionStorage.setItem('lastView', targetView);
                      window.dispatchEvent(new Event('viewChanged'));
                      haptic.medium();
                      onClose();
                    }}
                    className="flex items-center uppercase justify-center w-full px-4 py-3 text-base font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg touch-target"
                  >
                    {roleSwitchLabel}
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
