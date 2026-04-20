import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PlayerProfileSkeleton } from '@/components/shared/player';
import { PageHeaderSkeleton } from '@/components/shared/skeletons';

export default function PlayerProfileLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeaderSkeleton withBackButton />
        <PlayerProfileSkeleton />
      </div>
    </PageLayout>
  );
}
