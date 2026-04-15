'use client';

import { use } from 'react';
import { ResultsView } from '@/components/admin/results-view';

export default function AdminResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ResultsView eventId={id} />;
}
