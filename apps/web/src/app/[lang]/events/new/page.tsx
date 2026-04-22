import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { EventForm } from '@/components/admin/event-form';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function NewEventPage() {
  const t = await getTranslations('newEventPage');
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const venuesDescriptor = queries.venues();
  await queryClient.prefetchQuery({
    queryKey: venuesDescriptor.queryKey,
    queryFn: () => serverApiGet(venuesDescriptor.path, session),
  });

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-8">
          <PageHeader title={t('title')} description={t('description')} />
          <HydrationBoundary state={dehydrate(queryClient)}>
            <EventForm />
          </HydrationBoundary>
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
