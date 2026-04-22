import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { PlayersList } from '@/components/admin/players-list';
import { CreateInvitationDialog } from '@/components/admin/create-invitation-dialog';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function PlayersPage() {
  const t = await getTranslations('admin');
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const playersDescriptor = queries.players();
  await queryClient.prefetchQuery({
    queryKey: playersDescriptor.queryKey,
    queryFn: () => serverApiGet(playersDescriptor.path, session),
  });

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-8">
          <PageHeader
            title={t('playersManagement')}
            description={t('playersDescription')}
            action={<CreateInvitationDialog />}
          />
          <HydrationBoundary state={dehydrate(queryClient)}>
            <PlayersList />
          </HydrationBoundary>
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
