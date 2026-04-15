'use client';

import { use } from 'react';
import { ResultsView } from '@/components/player/results-view';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ResultsView eventId={id} />;
}
