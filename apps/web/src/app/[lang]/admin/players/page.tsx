import { PlayersList } from '@/components/admin/players-list';
import { getTranslations } from 'next-intl/server';

export default async function PlayersPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('playersManagement')}</h1>
          <p className="text-muted-foreground">{t('playersDescription')}</p>
        </div>
      </div>
      <PlayersList />
    </div>
  );
}
