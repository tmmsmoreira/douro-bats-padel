'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useTranslations } from 'next-intl';
import { PlayersList } from '@/components/admin/players-list';
import { CreateInvitationDialog } from '@/components/admin/create-invitation-dialog';

export default function PlayersPage() {
  const t = useTranslations('admin');

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
