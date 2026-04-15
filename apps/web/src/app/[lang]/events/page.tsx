'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { useTranslations } from 'next-intl';
import { EventsList } from '@/components/shared/event/events-list';
import { PastEventsList } from '@/components/shared/event/past-events-list';

export default function EventsPage() {
  const t = useTranslations('home');

  return (
    <PageLayout nav={<AdaptiveNav />}>
      <div className="space-y-12">
        {/* Upcoming Events Section */}
        <div className="space-y-6">
          <PageHeader
            title={t('upcomingEventsTitle')}
            description={t('upcomingEventsDescription')}
          />
          <EventsList />
        </div>

        {/* Past Events Section */}
        <div className="space-y-6">
          <PageHeader title={t('pastEventsTitle')} description={t('pastEventsDescription')} />
          <PastEventsList />
        </div>
      </div>
    </PageLayout>
  );
}
