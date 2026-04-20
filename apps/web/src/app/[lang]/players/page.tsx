'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { useTranslations } from 'next-intl';
import { PlayersList } from '@/components/admin/players-list';
import { CreateInvitationDialog } from '@/components/admin/create-invitation-dialog';

export default function PlayersPage() {
  const t = useTranslations('admin');

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-8">
          <PageHeader
            title={t('playersManagement')}
            description={t('playersDescription')}
            action={<CreateInvitationDialog />}
          />
          <PlayersList />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
