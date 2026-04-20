'use client';

import { use } from 'react';
import { ResultsView as AdminResultsView } from '@/components/admin/results-view';
import { ResultsView as PlayerResultsView } from '@/components/player/results-view';
import { useIsEditor } from '@/hooks';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isEditor = useIsEditor();

  if (isEditor) {
    return <AdminResultsView eventId={id} />;
  }

  return <PlayerResultsView eventId={id} />;
}
