import { auth } from "@/lib/auth"
import { EventsList } from "@/components/events-list"
import { PastEventsList } from "@/components/past-events-list"
import { Footer } from "@/components/footer"
import { getDictionary, type Locale } from "@/i18n"
import { HomeNavClient } from "@/components/client-nav-wrapper"

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth()
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="space-y-12">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{dict.home.title}</h1>
              <p className="text-muted-foreground">
                {session ? dict.home.description : dict.home.descriptionGuest}
              </p>
            </div>
            <EventsList />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{dict.home.pastEventsTitle}</h2>
              <p className="text-muted-foreground">{dict.home.pastEventsDescription}</p>
            </div>
            <PastEventsList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
