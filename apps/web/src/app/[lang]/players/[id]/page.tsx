import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { Footer } from '@/components/public/footer';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('playersList');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdaptiveNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl min-h-[500px]">
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
      </main>
      <Footer />
    </div>
  );
}
