"use client"

import { signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClearSessionPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear the session and redirect to home
    signOut({ redirect: false }).then(() => {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Redirect to home
      setTimeout(() => {
        router.push("/")
      }, 1000)
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing Session...</h1>
        <p className="text-muted-foreground">You will be redirected to the home page.</p>
      </div>
    </div>
  )
}

