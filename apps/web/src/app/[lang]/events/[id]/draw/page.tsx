'use client';

import { use } from 'react';
import { DrawView } from '@/components/shared/draw/draw-view';
import { useIsEditor } from '@/hooks';

export default function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isEditor = useIsEditor();
  return <DrawView eventId={id} isEditor={!!isEditor} />;
}
