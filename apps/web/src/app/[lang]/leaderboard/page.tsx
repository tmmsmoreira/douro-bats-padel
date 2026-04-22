import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { Leaderboard } from '@/components/player/leaderboard';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageHeader, PageLayout } from '@/components/shared';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function LeaderboardPage() {
  const t = await getTranslations('leaderboard');
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const leaderboardDescriptor = queries.leaderboard();
  await queryClient.prefetchQuery({
    queryKey: leaderboardDescriptor.queryKey,
    queryFn: () => serverApiGet(leaderboardDescriptor.path, session),
  });

  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={t('title')} description={t('description')} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Leaderboard />
        </HydrationBoundary>
      </div>
    </PageLayout>
  );
}
