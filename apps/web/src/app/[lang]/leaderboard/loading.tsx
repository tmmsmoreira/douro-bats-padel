import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { LeaderboardSkeleton } from '@/components/shared/skeletons';

export default function LeaderboardLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <LeaderboardSkeleton />
    </PageLayout>
  );
}
