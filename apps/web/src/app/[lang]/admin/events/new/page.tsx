import { EventForm } from '@/components/admin/event-form';
import { getTranslations } from 'next-intl/server';

export default async function NewEventPage() {
  const t = await getTranslations('newEventPage');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <EventForm />
    </div>
  );
}
