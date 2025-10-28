import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"

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
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
