import { EventsList } from '@/components/admin/events-list';
import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage() {
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
