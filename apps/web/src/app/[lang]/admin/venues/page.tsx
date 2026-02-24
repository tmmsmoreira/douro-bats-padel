import { VenuesList } from '@/components/admin/venues-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function VenuesPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('venuesManagement')}</h1>
          <p className="text-muted-foreground">{t('venuesDescription')}</p>
        </div>
        <div className="self-end sm:self-auto">
          <Link href="/admin/venues/new">
            <Button>{t('createVenue')}</Button>
          </Link>
        </div>
      </div>
      <VenuesList />
    </div>
  );
}
