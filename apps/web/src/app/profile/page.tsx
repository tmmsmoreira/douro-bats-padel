import { PlayerProfile } from "@/components/player/player-profile"
import { PlayerNav } from "@/components/player/player-nav"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8">
        <PlayerProfile />
      </main>
    </div>
  )
}
