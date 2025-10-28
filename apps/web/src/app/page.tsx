import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PlayerNav } from "@/components/player/player-nav"
import { EventsList as PlayerEventsList } from "@/components/player/events-list"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <p className="text-muted-foreground">Register for game nights and check your status</p>
          </div>
          <PlayerEventsList />
        </div>
      </main>
    </div>
  )
}
