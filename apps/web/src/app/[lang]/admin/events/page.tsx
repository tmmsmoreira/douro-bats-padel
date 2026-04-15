'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ActionButton } from '@/components/shared/action-button';
import { useTranslations } from 'next-intl';
import { EventsList } from '@/components/admin/events-list';

export default function AdminEventsPage() {
  const t = useTranslations('admin');

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
