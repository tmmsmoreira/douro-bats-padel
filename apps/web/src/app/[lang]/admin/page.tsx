import { EventsList } from "@/components/admin/events-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDictionary, type Locale } from "@/i18n"

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.admin.eventsManagement}</h1>
          <p className="text-muted-foreground">{dict.admin.eventsDescription}</p>
        </div>
        <Link href={`/${lang}/admin/events/new`}>
          <Button>{dict.admin.createEvent}</Button>
        </Link>
      </div>
      <EventsList />
    </div>
  )
}
