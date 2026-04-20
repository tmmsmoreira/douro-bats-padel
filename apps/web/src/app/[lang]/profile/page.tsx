import { PlayerProfile } from '@/components/player/player-profile';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout } from '@/components/shared';

export default function ProfilePage() {
  return (
    <PageLayout nav={<UnifiedNav />}>
      <PlayerProfile />
    </PageLayout>
  );
}
