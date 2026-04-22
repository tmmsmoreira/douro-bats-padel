'use client';

import { useTranslations } from 'next-intl';
import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { VenueFormSkeleton } from '@/components/shared/skeletons';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import { Card, CardContent } from '@/components/ui/card';
import { VenueForm } from '@/components/admin/venue-form';
import { useVenue } from '@/hooks/use-venues';

export function EditVenueClient({ venueId }: { venueId: string }) {
  const t = useTranslations('admin');
  const { data: venue, isLoading } = useVenue(venueId);
  const showLoading = useMinimumLoading(isLoading, !!venue);

  if (showLoading) {
    return (
      <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
        <VenueFormSkeleton />
      </PageLayout>
    );
  }

  if (!venue) {
    return (
      <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
        <EditorGuard>
          <div className="space-y-6">
            <PageHeader title={t('editVenue')} />
            <Card className="glass-card">
              <CardContent className="py-8 text-center text-destructive">
                {t('venueNotFound')}
              </CardContent>
            </Card>
          </div>
        </EditorGuard>
      </PageLayout>
    );
  }

  const initialData = {
    name: venue.name,
    address: venue.address ?? undefined,
    logo: venue.logo ?? undefined,
    courts: venue.courts ?? [],
  };

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-6">
          <PageHeader title={t('editVenue')} description={t('updateVenueDescription')} />
          <VenueForm venueId={venueId} initialData={initialData} />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
