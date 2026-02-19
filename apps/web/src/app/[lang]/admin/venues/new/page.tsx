import { VenueForm } from '@/components/admin/venue-form';
import { getTranslations } from 'next-intl/server';

export default async function NewVenuePage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('createVenue')}</h1>
        <p className="text-muted-foreground">{t('createVenueDescription')}</p>
      </div>
      <VenueForm />
    </div>
  );
}
