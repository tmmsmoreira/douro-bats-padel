import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { PlayerNav } from '@/components/player/player-nav';
import { Footer } from '@/components/footer';

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl">
        <PublicPlayerProfile playerId={id} />
      </main>
      <Footer />
    </div>
  );
}
