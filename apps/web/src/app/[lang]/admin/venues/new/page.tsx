import { VenueForm } from '@/components/admin/venue-form';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function NewVenuePage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <PageHeader title={t('createVenue')} description={t('createVenueDescription')} />
      <VenueForm />
    </div>
  );
}
