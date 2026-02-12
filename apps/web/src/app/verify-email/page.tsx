"use client"

import { Suspense } from "react"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}

