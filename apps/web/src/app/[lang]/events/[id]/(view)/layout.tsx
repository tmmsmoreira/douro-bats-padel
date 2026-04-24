'use client';

import { use } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { DataStateWrapper, PageHeader } from '@/components/shared';
import { EventHeaderInfo, EventTabs } from '@/components/shared/event';
import { EventLayoutSkeleton } from '@/components/shared/event/event-skeletons';
import { EventActionsDropdown } from '@/components/admin/event-actions-dropdown';
import { useIsFromBfcache, useIsEditor, useEventDetails } from '@/hooks';
import { useDraw } from '@/hooks/use-draws';

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const t = useTranslations('eventDetails');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isBackNav = useIsFromBfcache();
  const isEditor = useIsEditor();

  // Shares the ['event', eventId] cache key with `useEventDetails` on the
  // inner page; layout and page no longer double-fetch.
  const { data: event, isLoading, error } = useEventDetails(eventId);

  const { data: draw } = useDraw(eventId);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={event}
      error={error}
      loadingMessage={t('loadingEvent')}
      loadingComponent={<EventLayoutSkeleton />}
      emptyMessage={t('eventNotFound')}
      errorMessage={tErrors('failedToLoadEvent')}
    >
      {(event) => (
        <div className="space-y-4 md:space-y-6">
          <PageHeader
            title={event.title || t('untitledEvent')}
            description={
              <EventHeaderInfo
                event={event}
                locale={locale}
                showStatus={!!isEditor}
                actions={
                  isEditor ? (
                    <EventActionsDropdown
                      event={{
                        id: event.id,
                        state: event.state as
                          | 'DRAFT'
                          | 'OPEN'
                          | 'FROZEN'
                          | 'DRAWN'
                          | 'PUBLISHED'
                          | 'CANCELLED',
                        endsAt:
                          typeof event.endsAt === 'string'
                            ? event.endsAt
                            : new Date(event.endsAt).toISOString(),
                      }}
                      draw={draw ? { id: draw.id, eventId: draw.eventId } : null}
                      onDeleteSuccess={() => router.push('/events')}
                    />
                  ) : undefined
                }
              />
            }
            showBackButton
            backButtonHref="/events"
            backButtonLabel={t('backToEvents')}
          />

          <EventTabs
            eventId={eventId}
            basePath="/events"
            tabs={['details', 'draw', 'results']}
            disabledTabs={
              event.state === 'DRAWN' || event.state === 'PUBLISHED' ? [] : ['draw', 'results']
            }
          />

          <motion.div
            key={pathname}
            initial={isBackNav ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isBackNav ? 0 : 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </DataStateWrapper>
  );
}
