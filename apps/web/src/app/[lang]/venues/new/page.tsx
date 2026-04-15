'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { useTranslations } from 'next-intl';
import { VenueForm } from '@/components/admin/venue-form';

export default function NewVenuePage() {
  const t = useTranslations('admin');

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-6">
          <PageHeader title={t('createVenue')} description={t('createVenueDescription')} />
          <VenueForm />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
