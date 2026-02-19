'use client';

import { useState } from 'react';
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
import { User, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { LanguageToggleButton } from '@/components/language-toggle-button';
import { LanguageMenuItems } from '@/components/language-menu-items';
import { useTranslations } from 'next-intl';

export function HomeNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEditor =
    session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

  const navItems = [
    { href: `/`, label: t('events') },
    { href: `/leaderboard`, label: t('ranking') },
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
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <LanguageMenuItems />
                      <DropdownMenuSeparator />
                      <ThemeToggle />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
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
          <div className="flex md:hidden items-center gap-2">
            {!session && (
              <>
                <LanguageToggleButton />
                <ThemeToggleButton />
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}

            {session ? (
              <div className="space-y-3 pt-3 border-t">
                {isEditor && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {t('admin')}
                    </Button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </Button>
                </Link>

                {/* Theme and Language toggles for logged-in users */}
                <div className="flex items-center gap-2 px-3 py-2 border-t">
                  <LanguageToggleButton />
                  <ThemeToggleButton />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-3 border-t">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">{t('signIn')}</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
