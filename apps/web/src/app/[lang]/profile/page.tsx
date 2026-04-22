import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { PlayerProfile } from '@/components/player/player-profile';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout } from '@/components/shared';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function ProfilePage() {
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const profileDescriptor = queries.profile(session?.accessToken);
  const leaderboardDescriptor = queries.leaderboard();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: profileDescriptor.queryKey,
      queryFn: () => serverApiGet(profileDescriptor.path, session),
    }),
    queryClient.prefetchQuery({
      queryKey: leaderboardDescriptor.queryKey,
      queryFn: () => serverApiGet(leaderboardDescriptor.path, session),
    }),
  ]);

  return (
    <PageLayout nav={<UnifiedNav />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PlayerProfile />
      </HydrationBoundary>
    </PageLayout>
  );
}
