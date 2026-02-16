"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageMenuItems } from "@/components/language-menu-items"
import { useDictionary } from "@/components/dictionary-provider"
import { useLocale } from "@/hooks/use-locale"

export function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const dict = useDictionary()
  const locale = useLocale()

  const navItems = [
    { href: `/${locale}/admin`, label: dict.nav.events },
    { href: `/${locale}/admin/players`, label: dict.nav.players },
    { href: `/${locale}/admin/venues`, label: dict.nav.venues },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/admin`} className="text-lg font-bold">
            Padel Manager
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}`}>
            <Button variant="ghost" size="sm">
              {dict.nav.playerView}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={(session?.user as any)?.profilePhoto || undefined}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session?.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session?.user?.name && <p className="font-medium">{session.user.name}</p>}
                  {session?.user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{dict.nav.profile}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LanguageMenuItems />
              <DropdownMenuSeparator />
              <ThemeToggle />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{dict.nav.signOut}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
