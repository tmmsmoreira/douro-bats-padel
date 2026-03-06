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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="md:hidden fixed inset-0 top-16 bg-card z-100 overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-6 space-y-2">
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
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Account Section */}
            {session && showAccountSection && (
              <div className="space-y-1 pt-2 border-t">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('account') || 'Account'}
                </p>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-secondary"
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
              <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary">
                <span className="text-base font-medium">{t('language') || 'Language'}</span>
                <LanguageToggleButton />
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary">
                <span className="text-base font-medium">{t('theme') || 'Theme'}</span>
                <ThemeToggleButton />
              </div>
            </div>

            {/* Sign In/Out Section */}
            <div className="pt-2 border-t">
              {session ? (
                <button
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogoutIcon size={20} />
                  {t('signOut')}
                </button>
              ) : showSignInButton ? (
                <Link href="/login" onClick={onClose}>
                  <Button className="w-full" size="lg">
                    {t('signIn')}
                  </Button>
                </Link>
              ) : null}
            </div>

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
                    onClose();
                  }}
                  className="flex items-center uppercase justify-center w-full px-4 py-3 text-base font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {roleSwitchLabel}
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
