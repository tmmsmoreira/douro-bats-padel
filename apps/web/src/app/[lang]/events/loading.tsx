import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EventsListSkeleton } from '@/components/shared/event/event-skeletons';

export default function EventsLoading() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <EventsListSkeleton />
    </PageLayout>
  );
}
