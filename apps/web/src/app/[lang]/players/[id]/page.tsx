'use client';

import { use } from 'react';
import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageHeader } from '@/components/shared/layout/page-header';
import { PageLayout } from '@/components/shared';
import { useTranslations } from 'next-intl';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('playersList');

  return (
    <PageLayout nav={<UnifiedNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title={t('playerProfile')}
          description={t('playerProfileDescription')}
          showBackButton
          backButtonHref="/players"
          backButtonLabel={t('backToPlayers')}
        />
        <PublicPlayerProfile playerId={id} />
      </div>
    </PageLayout>
  );
}
