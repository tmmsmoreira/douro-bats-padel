import { EventsList } from '@/components/admin/events-list';
import { PageHeader } from '@/components/admin/page-header';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('eventsManagement')}
        description={t('eventsDescription')}
        buttonText={t('createEvent')}
        buttonHref="/admin/events/new"
      />
      <EventsList />
    </div>
  );
}
