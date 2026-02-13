import { Leaderboard } from "@/components/leaderboard"
import { HomeNav } from "@/components/home-nav"
import { Footer } from "@/components/footer"
import { getDictionary, type Locale } from "@/i18n"

export default async function LeaderboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{dict.leaderboard.title}</h1>
            <p className="text-muted-foreground">{dict.leaderboard.description}</p>
          </div>
          <Leaderboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
