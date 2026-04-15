'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { useTranslations } from 'next-intl';
import { VenuesList } from '@/components/admin/venues-list';

export default function VenuesPage() {
  const t = useTranslations('admin');

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
