import { PlayerProfile } from '@/components/player/player-profile';
import { Footer } from '@/components/shared/footer';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdaptiveNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 max-w-4xl min-h-[500px]">
        <PlayerProfile />
      </main>
      <Footer />
    </div>
  );
}
