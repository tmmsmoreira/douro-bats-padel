'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useActivePathname } from '@/hooks/use-active-pathname';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { UserIcon, LogoutIcon, LogoutIconHandle, UserIconHandle } from 'lucide-animated';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LOGO_BLUR_DATA_URL } from '@/lib/image-blur';
import { LanguageMenuItems } from '@/components/shared/language-menu-items';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { MobileMenu } from '@/components/shared/mobile-menu';

export function AdminNav() {
  const pathname = useActivePathname();
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signOutIconRef = useRef<LogoutIconHandle>(null);
  const userIconRef = useRef<UserIconHandle>(null);

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
    { href: '/admin', label: t('events') },
    { href: '/admin/players', label: t('players') },
    { href: '/leaderboard', label: t('ranking') },
    { href: '/admin/venues', label: t('venues') },
    { href: '/admin/invitations', label: t('invitations') },
  ];

  // Show loading skeleton while session is loading
  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/admin" className="flex items-center gap-3 shrink-0">
                <Image
                  src="/icons/logo.png"
                  alt="Douro Bats Padel"
                  width={40}
                  height={40}
                  priority
                  className="object-contain"
                />
                <span className="font-heading gradient-text text-xl font-bold">
                  Douro Bats Padel
                </span>
              </Link>
              {/* Loading skeleton for user avatar */}
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <nav
          id="navigation"
          aria-label="Admin navigation"
          className="border-b bg-card sticky top-0 z-50"
        >
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/admin" className="flex items-center gap-3 shrink-0">
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

              {/* Desktop Navigation */}
              <div className="hidden flex-1 md:flex items-center justify-between">
                <div className="flex flex-1 gap-2 justify-center px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-[999px]  transition-colors',
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
                  <Link
                    href="/"
                    onClick={() => {
                      sessionStorage.setItem('lastView', 'player');
                      window.dispatchEvent(new Event('viewChanged'));
                    }}
                  >
                    <Button variant="ghost" size="xs" className="uppercase dark:hover:bg-muted">
                      {t('playerView')}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={session?.user?.profilePhoto || undefined}
                            alt={session?.user?.name || 'User'}
                          />
                          <AvatarFallback className="gradient-primary">
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
                          {session?.user?.name && (
                            <p className="font-medium">{session.user.name}</p>
                          )}
                          {session?.user?.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        onMouseEnter={() => userIconRef.current?.startAnimation()}
                      >
                        <Link href="/profile" className="flex gap-2">
                          <UserIcon size={16} ref={userIconRef} />
                          <span>{t('profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <LanguageMenuItems />
                      <DropdownMenuSeparator />
                      <ThemeToggle />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex gap-2"
                        onMouseEnter={() => signOutIconRef.current?.startAnimation()}
                      >
                        <LogoutIcon size={16} ref={signOutIconRef} />
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
        session={session}
        navItems={navItems}
        t={t}
        showRoleSwitch={true}
        roleSwitchHref="/"
        roleSwitchLabel={t('playerView')}
        showAccountSection={true}
      />
    </>
  );
}
