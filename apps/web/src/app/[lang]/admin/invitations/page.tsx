import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const InvitationsList = dynamic(
  () =>
    import('@/components/admin/invitations-list').then((mod) => ({ default: mod.InvitationsList })),
  {
    loading: () => <LoadingState />,
  }
);

const CreateInvitationDialog = dynamic(() =>
  import('@/components/admin/create-invitation-dialog').then((mod) => ({
    default: mod.CreateInvitationDialog,
  }))
);

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
