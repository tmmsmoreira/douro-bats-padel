'use client';

import { useState, useEffect, useRef } from 'react';
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
import { UserIcon, LogoutIcon } from 'lucide-animated';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { LanguageMenuItems } from '@/components/shared/language-menu-items';
import { MenuToggle } from '@/components/shared/menu-toggle';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { MobileMenu } from '@/components/shared/mobile-menu';

export function HomeNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);
  const signOutIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);

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
    { href: `/`, label: t('events') },
    { href: `/leaderboard`, label: t('ranking') },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50"
      >
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
                          : 'text-muted-foreground hover:text-primary-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  {!session && (
                    <>
                      <LanguageToggleButton />
                      <ThemeToggleButton />
                    </>
                  )}
                  {session ? (
                    <>
                      {isEditor && (
                        <Link href="/admin">
                          <Button variant="ghost" size="xs" className="uppercase">
                            {t('adminView')}
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
                            <Link href="/profile" className="cursor-pointer flex gap-2">
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
                            className="cursor-pointer flex gap-2"
                            onMouseEnter={() => signOutIconRef.current?.startAnimation()}
                          >
                            <LogoutIcon size={16} ref={signOutIconRef} />
                            <span>{t('signOut')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/login">
                        <Button size="sm">{t('signIn')}</Button>
                      </Link>
                    </div>
                  )}
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
      </motion.header>

      {/* Full-Screen Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        session={session}
        navItems={navItems}
        t={t}
        showRoleSwitch={session ? isEditor : false}
        roleSwitchHref="/admin"
        roleSwitchLabel={t('adminView')}
        showAccountSection={!!session}
        showSignInButton={!session}
      />
    </>
  );
}
