'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { VenueForm } from '@/components/admin/venue-form';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import { Card, CardContent } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  // Use minimum loading to prevent jarring flashes
  const showLoading = useMinimumLoading(isLoading, !!venue);

  if (showLoading) {
    return <LoadingState message={t('loadingVenue')} />;
  }

  if (!venue) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('editVenue')} />
        <Card className="glass-card">
          <CardContent className="py-8 text-center text-destructive">
            {t('venueNotFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('editVenue')} description={t('updateVenueDescription')} />
      <VenueForm venueId={venueId} initialData={venue} />
    </div>
  );
}
