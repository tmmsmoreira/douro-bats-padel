import { ResendVerificationForm } from "@/components/auth/resend-verification-form"
import { LanguageToggleButton } from "@/components/language-toggle-button"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

export default function ResendVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>

      <ResendVerificationForm />
    </div>
  )
}

