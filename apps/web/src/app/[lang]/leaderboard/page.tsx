import { Leaderboard } from '@/components/player/leaderboard';
import { Footer } from '@/components/public/footer';
import { getTranslations } from 'next-intl/server';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { PageHeader } from '@/components/shared/page-header';

export default async function LeaderboardPage() {
  const t = await getTranslations('leaderboard');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeAdaptiveNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl min-h-[500px]">
        <div className="space-y-4 sm:space-y-6">
          <PageHeader title={t('title')} description={t('description')} />
          <Leaderboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
