"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

const navItems = [
  { href: "/", label: "Events" },
  { href: "/leaderboard", label: "Ranking" },
  { href: "/profile", label: "Profile" },
]

export function PlayerNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isEditor = session?.user?.roles?.includes("EDITOR") || session?.user?.roles?.includes("ADMIN")

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
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
        <div className="flex items-center gap-4">
          {isEditor && (
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                Admin Panel
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
