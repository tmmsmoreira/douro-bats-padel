import { EventsList } from "@/components/admin/events-list"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminPage() {
  const t = await getTranslations('admin')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('eventsManagement')}</h1>
          <p className="text-muted-foreground">{t('eventsDescription')}</p>
        </div>
        <Link href="/admin/events/new">
          <Button>{t('createEvent')}</Button>
        </Link>
      </div>
      <EventsList />
    </div>
  )
}
