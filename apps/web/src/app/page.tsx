import { auth } from "@/lib/auth"
import { HomeNav } from "@/components/home-nav"
import { EventsList } from "@/components/events-list"
import { Footer } from "@/components/footer"

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <p className="text-muted-foreground">
              {session ? "Register for game nights and check your status" : "Sign in to register for game nights"}
            </p>
          </div>
          <EventsList />
        </div>
      </main>
      <Footer />
    </div>
  )
}
