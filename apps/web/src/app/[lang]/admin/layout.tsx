import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Footer } from "@/components/footer"
import { AdminNavClient } from "@/components/client-nav-wrapper"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const isEditor = session.user.roles?.includes("EDITOR") || session.user.roles?.includes("ADMIN")

  if (!isEditor) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavClient />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">{children}</main>
      <Footer />
    </div>
  )
}
