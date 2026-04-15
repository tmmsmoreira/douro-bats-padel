'use client';

import { use } from 'react';
import { DrawView } from '@/components/player/draw-view';

export default function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DrawView eventId={id} />;
}
