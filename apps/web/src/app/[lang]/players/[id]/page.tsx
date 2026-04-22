import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout } from '@/components/shared';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const playerDescriptor = queries.player(id);
  await queryClient.prefetchQuery({
    queryKey: playerDescriptor.queryKey,
    queryFn: () => serverApiGet(playerDescriptor.path, session),
  });

  return (
    <PageLayout nav={<UnifiedNav />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicPlayerProfile playerId={id} />
      </HydrationBoundary>
    </PageLayout>
  );
}
