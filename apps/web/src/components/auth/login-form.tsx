"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please sign in.")
    }
    if (searchParams.get("reset") === "true") {
      setSuccessMessage("Password reset successfully! Please sign in with your new password.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access Padel Manager</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
            <div className="pt-2 border-t">
              <p className="font-medium">Demo credentials:</p>
              <p>Editor: tiago@dorobats.com / editor123</p>
              <p>Admin: admin@dorobats.com / admin123</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
