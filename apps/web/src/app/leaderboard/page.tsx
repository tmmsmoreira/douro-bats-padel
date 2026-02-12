import { Leaderboard } from "@/components/leaderboard"
import { HomeNav } from "@/components/home-nav"
import { Footer } from "@/components/footer"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Ranking</h1>
            <p className="text-muted-foreground">Player rankings based on last 5 weeks performance</p>
          </div>
          <Leaderboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
