'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { LanguageToggleButton } from '@/components/language-toggle-button';
import { LanguageMenuItems } from '@/components/language-menu-items';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { useTranslations } from 'next-intl';

export function PlayerNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
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

  const isEditor =
    session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

  const navItems = [
    { href: '/', label: t('events') },
    { href: '/leaderboard', label: t('ranking') },
  ];

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-base sm:text-lg font-bold shrink-0">
            Padel Manager
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isEditor && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    {t('admin')}
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session?.user?.profilePhoto || undefined}
                        alt={session?.user?.name || 'User'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session?.user?.name && <p className="font-medium">{session.user.name}</p>}
                      {session?.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex gap-2">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <LanguageMenuItems />
                  <DropdownMenuSeparator />
                  <ThemeToggle />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer flex gap-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

        {/* Full-Screen Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-card z-50 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 space-y-2">
              {/* User Profile Section */}
              {session && (
                <div className="flex items-center gap-4 pb-6 border-b">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={(session?.user as any)?.profilePhoto || undefined}
                      alt={session?.user?.name || 'User'}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Account Section */}
              <div className="space-y-1 pt-2 border-t">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('account') || 'Account'}
                </p>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-foreground hover:bg-accent"
                >
                  <User className="h-5 w-5" />
                  {t('profile')}
                </Link>
              </div>

              {/* Settings Section */}
              <div className="space-y-1 pt-2 border-t">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('settings') || 'Settings'}
                </p>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent">
                  <span className="text-base font-medium">{t('language') || 'Language'}</span>
                  <LanguageToggleButton />
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent">
                  <span className="text-base font-medium">{t('theme') || 'Theme'}</span>
                  <ThemeToggleButton />
                </div>
              </div>

              {/* Sign Out Section */}
              <div className="pt-2 border-t">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  {t('signOut')}
                </button>
              </div>

              {/* Role Switching Section */}
              {isEditor && (
                <div className="pt-2 border-t">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center uppercase justify-center w-full px-4 py-3 text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {t('admin')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
