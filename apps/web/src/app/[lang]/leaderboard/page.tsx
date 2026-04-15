'use client';

import { Leaderboard } from '@/components/player/leaderboard';
import { useTranslations } from 'next-intl';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { PageHeader, PageLayout } from '@/components/shared';

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');

  return (
    <PageLayout nav={<AdaptiveNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title={t('title')} description={t('description')} />
        <Leaderboard />
      </div>
    </PageLayout>
  );
}
