import { VenuesList } from '@/components/admin/venues-list';
import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { getTranslations } from 'next-intl/server';

export default async function VenuesPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('venuesManagement')}
        description={t('venuesDescription')}
        action={<ActionButton href="/admin/venues/new" label={t('createVenue')} />}
      />
      <VenuesList />
    </div>
  );
}
