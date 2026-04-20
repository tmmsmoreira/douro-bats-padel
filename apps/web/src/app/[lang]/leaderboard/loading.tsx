import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { LeaderboardSkeleton, PageHeaderSkeleton } from '@/components/shared/skeletons';

export default function LeaderboardLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeaderSkeleton />
        <LeaderboardSkeleton />
      </div>
    </PageLayout>
  );
}
