import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const VenuesList = dynamic(
  () => import('@/components/admin/venues-list').then((mod) => ({ default: mod.VenuesList })),
  {
    loading: () => <LoadingState />,
    ssr: false,
  }
);

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
