import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const EventsList = dynamic(
  () => import('@/components/admin/events-list').then((mod) => ({ default: mod.EventsList })),
  {
    loading: () => <LoadingState />,
  }
);

export default async function AdminEventsPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('eventsManagement')}
        description={t('eventsDescription')}
        action={<ActionButton href="/admin/events/new" label={t('createEvent')} />}
      />
      <EventsList />
    </div>
  );
}
