import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PlayerProfileSkeleton } from '@/components/shared/player/player-skeletons';

export default function ProfileLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <PlayerProfileSkeleton />
    </PageLayout>
  );
}
