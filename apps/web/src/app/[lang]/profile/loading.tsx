import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PlayerProfileSkeleton } from '@/components/shared/player/player-skeletons';
import { PageHeaderSkeleton } from '@/components/shared/skeletons';

export default function ProfileLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <PlayerProfileSkeleton />
      </div>
    </PageLayout>
  );
}
