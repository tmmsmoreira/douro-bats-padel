import { auth } from '@/lib/auth';
import { EventsList } from '@/components/shared/events-list';
import { PastEventsList } from '@/components/shared/past-events-list';
import { Footer } from '@/components/public/footer';
import { getTranslations } from 'next-intl/server';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { PageHeader } from '@/components/shared/page-header';

export default async function HomePage() {
  const session = await auth();
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeAdaptiveNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl">
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
      </main>
      <Footer />
    </div>
  );
}
