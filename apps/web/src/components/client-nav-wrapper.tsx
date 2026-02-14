"use client"

import dynamic from "next/dynamic"

// Import navigation components as client-only to prevent hydration errors with Radix UI
export const HomeNavClient = dynamic(() => import("@/components/home-nav").then((mod) => mod.HomeNav), {
  ssr: false,
})

export const AdminNavClient = dynamic(() => import("@/components/admin/admin-nav").then((mod) => mod.AdminNav), {
  ssr: false,
})

export const PlayerNavClient = dynamic(() => import("@/components/player/player-nav").then((mod) => mod.PlayerNav), {
  ssr: false,
})

