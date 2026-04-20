'use client';

import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { EditorGuard } from '@/components/shared/editor-guard';
import { useTranslations } from 'next-intl';
import { EventForm } from '@/components/admin/event-form';

export default function NewEventPage() {
  const t = useTranslations('newEventPage');

  return (
    <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
      <EditorGuard>
        <div className="space-y-8">
          <PageHeader title={t('title')} description={t('description')} />
          <EventForm />
        </div>
      </EditorGuard>
    </PageLayout>
  );
}
