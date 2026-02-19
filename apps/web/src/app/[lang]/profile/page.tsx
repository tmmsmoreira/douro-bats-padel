import { PlayerProfile } from '@/components/player/player-profile';
import { Footer } from '@/components/footer';
import { PlayerNavClient } from '@/components/client-nav-wrapper';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl">
        <PlayerProfile />
      </main>
      <Footer />
    </div>
  );
}
