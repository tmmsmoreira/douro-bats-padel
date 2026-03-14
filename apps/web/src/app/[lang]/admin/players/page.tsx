import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const PlayersList = dynamic(
  () => import('@/components/admin/players-list').then((mod) => ({ default: mod.PlayersList })),
  {
    loading: () => <LoadingState />,
  }
);

const CreateInvitationDialog = dynamic(() =>
  import('@/components/admin/create-invitation-dialog').then((mod) => ({
    default: mod.CreateInvitationDialog,
  }))
);

export default async function PlayersPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('playersManagement')}
        description={t('playersDescription')}
        action={<CreateInvitationDialog />}
      />
      <PlayersList />
    </div>
  );
}
