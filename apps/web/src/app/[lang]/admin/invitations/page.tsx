import { InvitationsList } from '@/components/admin/invitations-list';
import { CreateInvitationDialog } from '@/components/admin/create-invitation-dialog';
import { getTranslations } from 'next-intl/server';

export default async function InvitationsPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('invitationsManagement')}</h1>
          <p className="text-muted-foreground">{t('invitationsDescription')}</p>
        </div>
        <CreateInvitationDialog />
      </div>
      <InvitationsList />
    </div>
  );
}
