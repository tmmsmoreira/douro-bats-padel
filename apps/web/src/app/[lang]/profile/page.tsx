import { PlayerProfile } from '@/components/player/player-profile';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';
import { PageLayout } from '@/components/shared';

export default function ProfilePage() {
  return (
    <PageLayout nav={<AdaptiveNav />}>
      <PlayerProfile />
    </PageLayout>
  );
}
