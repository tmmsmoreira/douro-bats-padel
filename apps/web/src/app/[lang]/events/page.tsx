import dynamic from 'next/dynamic';
import { PageHeader, PageLayout } from '@/components/shared';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { getTranslations } from 'next-intl/server';
import { LoadingState } from '@/components/shared';

const EventsList = dynamic(
  () =>
    import('@/components/shared/event/events-list').then((mod) => ({ default: mod.EventsList })),
  {
    loading: () => <LoadingState />,
  }
);

const PastEventsList = dynamic(
  () =>
    import('@/components/shared/event/past-events-list').then((mod) => ({
      default: mod.PastEventsList,
    })),
  {
    loading: () => <LoadingState />,
  }
);

export default async function EventsPage() {
  const t = await getTranslations('home');

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
