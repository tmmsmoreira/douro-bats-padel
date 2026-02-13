import { PlayerProfile } from "@/components/player/player-profile"
import { PlayerNav } from "@/components/player/player-nav"
import { Footer } from "@/components/footer"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <PlayerProfile />
      </main>
      <Footer />
    </div>
  )
}
