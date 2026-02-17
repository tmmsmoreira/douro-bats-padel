import { Leaderboard } from "@/components/leaderboard"
import { Footer } from "@/components/footer"
import { getTranslations } from "next-intl/server"
import { HomeNavClient } from "@/components/client-nav-wrapper"

export default async function LeaderboardPage() {
  const t = await getTranslations('leaderboard')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('description')}</p>
          </div>
          <Leaderboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
