import { ResultsView } from '@/components/admin/results-view';

export default async function AdminResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ResultsView eventId={id} />;
}
