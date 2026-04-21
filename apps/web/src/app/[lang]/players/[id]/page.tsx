'use client';

import { use } from 'react';
import { PublicPlayerProfile } from '@/components/player/public-player-profile';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { PageLayout } from '@/components/shared';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <PageLayout nav={<UnifiedNav />}>
      <PublicPlayerProfile playerId={id} />
    </PageLayout>
  );
}
