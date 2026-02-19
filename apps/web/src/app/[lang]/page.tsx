import { auth } from '@/lib/auth';
import { EventsList } from '@/components/events-list';
import { PastEventsList } from '@/components/past-events-list';
import { Footer } from '@/components/footer';
import { getTranslations } from 'next-intl/server';
import { HomeNavClient } from '@/components/client-nav-wrapper';

export default async function HomePage() {
  const session = await auth();
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl">
        <div className="space-y-8 sm:space-y-12">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {session ? t('description') : t('descriptionGuest')}
              </p>
            </div>
            <EventsList />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{t('pastEventsTitle')}</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {t('pastEventsDescription')}
              </p>
            </div>
            <PastEventsList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
