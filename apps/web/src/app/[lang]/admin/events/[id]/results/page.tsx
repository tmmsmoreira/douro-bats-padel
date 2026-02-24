import { ResultsEntry } from '@/components/admin/results-entry';

export default async function AdminResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enter Match Results</h1>
        <p className="text-muted-foreground mt-2">
          Enter scores for each match. Results can be saved as drafts and published later.
        </p>
      </div>
      <ResultsEntry eventId={id} />
    </div>
  );
}
