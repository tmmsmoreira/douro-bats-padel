import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EventFormSkeleton } from '@/components/shared/event/event-skeletons';

export default function NewEventLoading() {
  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EventFormSkeleton />
    </PageLayout>
  );
}
