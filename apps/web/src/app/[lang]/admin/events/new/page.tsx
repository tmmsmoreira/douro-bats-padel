'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useTranslations } from 'next-intl';
import { EventForm } from '@/components/admin/event-form';

export default function NewEventPage() {
  const t = useTranslations('newEventPage');

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} description={t('description')} />
      <EventForm />
    </div>
  );
}
