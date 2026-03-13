import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const EventForm = dynamic(
  () => import('@/components/admin/event-form').then((mod) => ({ default: mod.EventForm })),
  {
    loading: () => <LoadingState />,
  }
);

export default async function NewEventPage() {
  const t = await getTranslations('newEventPage');

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} description={t('description')} />
      <EventForm />
    </div>
  );
}
