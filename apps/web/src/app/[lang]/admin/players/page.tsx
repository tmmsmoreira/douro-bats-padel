import { PlayersList } from "@/components/admin/players-list"
import { getDictionary, type Locale } from "@/i18n"

export default async function PlayersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.admin.playersManagement}</h1>
          <p className="text-muted-foreground">{dict.admin.playersDescription}</p>
        </div>
      </div>
      <PlayersList />
    </div>
  )
}

