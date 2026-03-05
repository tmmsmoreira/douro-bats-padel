import { ResultsEntry } from '@/components/admin/results-entry';

export default async function AdminResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ResultsEntry eventId={id} />;
}
