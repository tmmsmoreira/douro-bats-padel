import { VenuesList } from '@/components/admin/venues-list';
import { PageHeader } from '@/components/admin/page-header';
import { getTranslations } from 'next-intl/server';

export default async function VenuesPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('venuesManagement')}
        description={t('venuesDescription')}
        buttonText={t('createVenue')}
        buttonHref="/admin/venues/new"
      />
      <VenuesList />
    </div>
  );
}
