import { InvitationsList } from '@/components/admin/invitations-list';
import { CreateInvitationDialog } from '@/components/admin/create-invitation-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { getTranslations } from 'next-intl/server';

export default async function InvitationsPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('invitationsManagement')}
        description={t('invitationsDescription')}
        action={<CreateInvitationDialog />}
      />
      <InvitationsList />
    </div>
  );
}
