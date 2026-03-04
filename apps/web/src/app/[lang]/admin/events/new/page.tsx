import { EventForm } from '@/components/admin/event-form';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function NewEventPage() {
  const t = await getTranslations('newEventPage');

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} description={t('description')} />
      <EventForm />
    </div>
  );
}
