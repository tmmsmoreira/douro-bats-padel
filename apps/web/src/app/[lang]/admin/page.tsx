import { EventsList } from '@/components/admin/events-list';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('eventsManagement')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('eventsDescription')}
          </p>
        </div>
        <Link href="/admin/events/new" className="shrink-0">
          <Button className="w-full sm:w-auto">{t('createEvent')}</Button>
        </Link>
      </div>
      <EventsList />
    </div>
  );
}
