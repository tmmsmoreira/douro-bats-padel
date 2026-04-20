'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useActivePathname } from '@/hooks/use-active-pathname';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useIsEditor } from '@/hooks/use-is-editor';
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
import { motion } from 'motion/react';
import {
  UserIcon,
  LogoutIcon,
  CalendarDaysIcon,
  UsersIcon,
  TrendingUpIcon,
  MapPinIcon,
} from 'lucide-animated';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageMenuItems } from '@/components/shared/language-menu-items';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { MobileMenu } from '@/components/shared/mobile-menu';

export function UnifiedNav() {
  const pathname = useActivePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNavVisible = useScrollDirection();
  const isEditor = useIsEditor();

  const userIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);
  const signOutIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === '/') return '/';
    if (pathname === '/events') return '/events';
    if (pathname === '/leaderboard') return '/leaderboard';
    if (pathname === '/profile') return '/profile';
    if (pathname.startsWith('/players')) return '/players';
    if (pathname.startsWith('/venues')) return '/venues';
    if (pathname.startsWith('/events/')) return '/events';
    return pathname;
  };

  const activeTab = getActiveTab();
  const prevActiveTabRef = useRef(activeTab);
  const animatingRef = useRef(false);

  if (prevActiveTabRef.current !== activeTab) {
    animatingRef.current = true;
    prevActiveTabRef.current = activeTab;
  }

  const navTransition = animatingRef.current
    ? {
        type: 'spring' as const,
        stiffness: 500,
        damping: 40,
        onComplete: () => {
          animatingRef.current = false;
        },
      }
    : { duration: 0 };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Nav items based on role
  const navItems = isEditor
    ? [
        { href: '/events', label: t('events') },
        { href: '/players', label: t('players') },
        { href: '/leaderboard', label: t('ranking') },
        { href: '/venues', label: t('venues') },
      ]
    : [
        { href: '/events', label: t('events') },
        { href: '/leaderboard', label: t('ranking') },
      ];

  // Tab bar items based on role
  const tabBarItems = isEditor
    ? [
        {
          id: '/events',
          label: t('events'),
          icon: <CalendarDaysIcon className="w-6 h-6" />,
          onClick: () => router.push('/events'),
        },
        {
          id: '/players',
          label: t('players'),
          icon: <UsersIcon className="w-6 h-6" />,
          onClick: () => router.push('/players'),
        },
        {
          id: '/leaderboard',
          label: t('ranking'),
          icon: <TrendingUpIcon className="w-6 h-6" />,
          onClick: () => router.push('/leaderboard'),
        },
        {
          id: '/venues',
          label: t('venues'),
          icon: <MapPinIcon className="w-6 h-6" />,
          onClick: () => router.push('/venues'),
        },
      ]
    : [
        {
          id: '/events',
          label: t('events'),
          icon: <CalendarDaysIcon className="w-6 h-6" />,
          onClick: () => router.push('/events'),
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

  const isNavItemActive = (href: string) => {
    return activeTab === href;
  };

  // Show loading skeleton while session is loading
  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
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
        <nav id="navigation" aria-label="Main navigation">
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

              {/* Desktop Navigation */}
              <div className="hidden md:flex flex-1 items-center justify-between">
                <div className="flex flex-1 gap-2 px-14">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'relative px-4 py-2 text-sm font-medium rounded-[999px] transition-colors',
                        isNavItemActive(item.href)
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground hover:text-muted-foreground/60'
                      )}
                    >
                      {isNavItemActive(item.href) && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-primary rounded-[999px]"
                          transition={navTransition}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
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
        showAccountSection={true}
      />

      {/* Mobile Tab Bar */}
      <TabBar items={tabBarItems} activeTab={activeTab} className="md:hidden" variant="ios" />
    </>
  );
}
