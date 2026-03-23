'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useActivePathname } from '@/hooks/use-active-pathname';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TabBar } from '@/components/ui/tab-bar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import {
  UserIcon,
  LogoutIcon,
  EyeIcon,
  EyeIconHandle,
  CalendarDaysIcon,
  TrendingUpIcon,
} from 'lucide-animated';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LOGO_BLUR_DATA_URL } from '@/lib/image-blur';
import { LanguageMenuItems } from '@/components/shared/language-menu-items';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { MobileMenu } from '@/components/shared/mobile-menu';

export function PlayerNav() {
  const pathname = useActivePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNavVisible = useScrollDirection();

  const userIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);
  const signOutIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);
  const eyeIconRef = useRef<EyeIconHandle>(null);

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

  // Tab bar items for mobile navigation
  const tabBarItems = [
    {
      id: '/',
      label: t('events'),
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      onClick: () => router.push('/'),
    },
    {
      id: '/leaderboard',
      label: t('ranking'),
      icon: <TrendingUpIcon className="w-6 h-6" />,
      onClick: () => router.push('/leaderboard'),
    },
    {
      id: '/profile',
      label: t('profile'),
      icon: <UserIcon className="w-6 h-6" />,
      onClick: () => router.push('/profile'),
    },
  ];

  // Show loading skeleton while session is loading
  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <nav className="border-b bg-card sticky top-0 z-50">
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
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 md:bg-card backdrop-blur-xl md:border-b border-border/50 safe-top transition-transform duration-300',
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        )}
        style={{ marginRight: 'var(--removed-body-scroll-bar-size, 0px)' }}
      >
        <nav id="navigation" aria-label="Player navigation">
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

              {/* Desktop Navigation - Only shown on desktop (md and up) */}
              <div className="hidden md:flex flex-1 items-center justify-between">
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
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                        animate={false}
                      >
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
                      {isEditor && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            asChild
                            onMouseEnter={() => eyeIconRef.current?.startAnimation()}
                          >
                            <Link
                              href="/admin"
                              onClick={() => {
                                sessionStorage.setItem('lastView', 'admin');
                                // Don't dispatch viewChanged immediately - let the URL change first
                                // The AdaptiveNav will detect the URL change and switch automatically
                              }}
                              className="flex gap-2"
                            >
                              <EyeIcon size={16} ref={eyeIconRef} />
                              <span>{t('adminView')}</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
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
        showRoleSwitch={isEditor}
        roleSwitchHref="/admin"
        roleSwitchLabel={t('adminView')}
        showAccountSection={true}
      />

      {/* Mobile Tab Bar - Only visible on mobile */}
      <TabBar items={tabBarItems} activeTab={pathname} className="md:hidden" variant="ios" />
    </>
  );
}
