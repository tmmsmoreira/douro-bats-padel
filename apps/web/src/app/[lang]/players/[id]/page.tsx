import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { PageHeader } from '@/components/shared/page-header';
import { PageLayout } from '@/components/shared';
import { getTranslations } from 'next-intl/server';

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('playersList');

  return (
    <PageLayout nav={<AdaptiveNav />}>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title={t('playerProfile')}
          description={t('playerProfileDescription')}
          showBackButton
          backButtonHref="/admin/players"
          backButtonLabel={t('backToPlayers')}
        />
        <PublicPlayerProfile playerId={id} />
      </div>
    </PageLayout>
  );
}
