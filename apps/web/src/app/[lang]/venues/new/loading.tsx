import { PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { VenueFormSkeleton } from '@/components/shared/skeletons';

export default function NewVenueLoading() {
  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <VenueFormSkeleton />
    </PageLayout>
  );
}
