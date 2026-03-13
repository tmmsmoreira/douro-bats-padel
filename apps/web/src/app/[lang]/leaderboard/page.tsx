import { Leaderboard } from '@/components/player/leaderboard';
import { getTranslations } from 'next-intl/server';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { PageHeader, PageLayout } from '@/components/shared';

export default async function LeaderboardPage() {
  const t = await getTranslations('leaderboard');

  return (
    <PageLayout nav={<AdaptiveNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={t('title')} description={t('description')} />
        <Leaderboard />
      </div>
    </PageLayout>
  );
}
