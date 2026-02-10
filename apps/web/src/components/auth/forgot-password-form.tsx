"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Failed to send reset email")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      setSuccess(true)
      // For development: show the token
      if (data.token) {
        setResetToken(data.token)
      }
      setIsLoading(false)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Password reset instructions have been sent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists with the email <strong>{email}</strong>, you will receive password reset
            instructions.
          </p>
          {resetToken && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-2">Development Mode - Reset Token:</p>
              <code className="text-xs bg-white p-2 block rounded border break-all">{resetToken}</code>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Click here to reset your password
              </Link>
            </div>
          )}
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Enter your email to reset your password</CardDescription>
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

