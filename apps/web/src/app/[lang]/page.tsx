import { auth } from '@/lib/auth';
import { EventsList, PastEventsList } from '@/components/shared/event';
import { getTranslations } from 'next-intl/server';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { PageHeader, PageLayout } from '@/components/shared';

export default async function HomePage() {
  const session = await auth();
  const t = await getTranslations('home');

  return (
    <PageLayout nav={<HomeAdaptiveNav />}>
      <div className="space-y-8 sm:space-y-12">
        <div className="space-y-4 sm:space-y-6">
          <PageHeader
            title={t('title')}
            description={session ? t('description') : t('descriptionGuest')}
          />
          <EventsList />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <PageHeader title={t('pastEventsTitle')} description={t('pastEventsDescription')} />
          <PastEventsList />
        </div>
      </div>
    </PageLayout>
  );
}
