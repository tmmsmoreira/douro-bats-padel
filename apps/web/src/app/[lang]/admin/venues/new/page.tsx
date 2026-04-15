'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useTranslations } from 'next-intl';
import { VenueForm } from '@/components/admin/venue-form';

export default function NewVenuePage() {
  const t = useTranslations('admin');

  return (
    <div className="space-y-6">
      <PageHeader title={t('createVenue')} description={t('createVenueDescription')} />
      <VenueForm />
    </div>
  );
}
