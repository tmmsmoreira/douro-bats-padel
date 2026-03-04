import { PlayersList } from '@/components/admin/players-list';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function PlayersPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader title={t('playersManagement')} description={t('playersDescription')} />
      <PlayersList />
    </div>
  );
}
