'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { ActionButton } from '@/components/shared/action-button';
import { useTranslations } from 'next-intl';
import { VenuesList } from '@/components/admin/venues-list';

export default function VenuesPage() {
  const t = useTranslations('admin');

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-8">
          <PageHeader
            title={t('venuesManagement')}
            description={t('venuesDescription')}
            action={<ActionButton href="/venues/new" label={t('createVenue')} />}
          />
          <VenuesList />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
