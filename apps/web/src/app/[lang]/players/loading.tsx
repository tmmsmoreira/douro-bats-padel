import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PlayersListSkeleton } from '@/components/shared/player/player-skeletons';
import { PageHeaderSkeleton } from '@/components/shared/skeletons';

export default function PlayersLoading() {
  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <div className="space-y-8">
        <PageHeaderSkeleton withAction />
        <PlayersListSkeleton />
      </div>
    </PageLayout>
  );
}
