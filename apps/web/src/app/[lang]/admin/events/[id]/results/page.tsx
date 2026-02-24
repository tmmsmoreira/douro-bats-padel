import { ResultsEntry } from '@/components/admin/results-entry';
import { getTranslations } from 'next-intl/server';

export default async function AdminResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('resultsPage');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      <ResultsEntry eventId={id} />
    </div>
  );
}
