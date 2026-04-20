import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PlayersListSkeleton } from '@/components/shared/player/player-skeletons';

export default function PlayersLoading() {
  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <PlayersListSkeleton />
    </PageLayout>
  );
}
