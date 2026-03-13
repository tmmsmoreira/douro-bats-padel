import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const VenueForm = dynamic(
  () => import('@/components/admin/venue-form').then((mod) => ({ default: mod.VenueForm })),
  {
    loading: () => <LoadingState />,
    ssr: false,
  }
);

export default async function NewVenuePage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <PageHeader title={t('createVenue')} description={t('createVenueDescription')} />
      <VenueForm />
    </div>
  );
}
