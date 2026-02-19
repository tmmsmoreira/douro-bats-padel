'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { VenueForm } from '@/components/admin/venue-form';
import { useTranslations } from 'next-intl';

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
  const tCommon = useTranslations('common');

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('editVenue')}</h1>
          <p className="text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('editVenue')}</h1>
          <p className="text-muted-foreground text-destructive">Venue not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('editVenue')}</h1>
        <p className="text-muted-foreground">{t('updateVenueDescription')}</p>
      </div>
      <VenueForm venueId={venueId} initialData={venue} />
    </div>
  );
}
