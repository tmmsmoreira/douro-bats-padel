'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { ActionButton } from '@/components/shared/action-button';
import { useTranslations } from 'next-intl';
import { EventsList } from '@/components/shared/event/events-list';
import { PastEventsList } from '@/components/shared/event/past-events-list';
import { EventsList as AdminEventsList } from '@/components/admin/events-list';
import { useIsEditor } from '@/hooks';

export default function EventsPage() {
  const tHome = useTranslations('home');
  const tAdmin = useTranslations('admin');
  const isEditor = useIsEditor();

  if (isEditor) {
    return (
      <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
        <div className="space-y-8">
          <PageHeader
            title={tAdmin('eventsManagement')}
            description={tAdmin('eventsDescription')}
            action={<ActionButton href="/events/new" label={tAdmin('createEvent')} />}
          />
          <AdminEventsList />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-12">
        <div className="space-y-6">
          <PageHeader
            title={tHome('upcomingEventsTitle')}
            description={tHome('upcomingEventsDescription')}
          />
          <EventsList />
        </div>
        <div className="space-y-6">
          <PageHeader
            title={tHome('pastEventsTitle')}
            description={tHome('pastEventsDescription')}
          />
          <PastEventsList />
        </div>
      </div>
    </PageLayout>
  );
}
