'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { VenueForm } from '@/components/admin/venue-form';
import { useTranslations } from 'next-intl';
import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { LoadingState } from '@/components/shared/state/loading-state';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL } from '@/lib/constants';

interface Venue {
  id: string;
  name: string;
  address?: string;
  logo?: string;
  courts: Array<{ id: string; label: string }>;
}

export default function EditVenuePage() {
  const params = useParams();
  const venueId = params.id as string;
  const t = useTranslations('admin');

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/venues/${venueId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch venue');
      }
      return res.json();
    },
  });

  const showLoading = useMinimumLoading(isLoading, !!venue);

  if (showLoading) {
    return (
      <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
        <LoadingState message={t('loadingVenue')} />
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

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-6">
          <PageHeader title={t('editVenue')} description={t('updateVenueDescription')} />
          <VenueForm venueId={venueId} initialData={venue} />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
