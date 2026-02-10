"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { useState } from "react"
import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
