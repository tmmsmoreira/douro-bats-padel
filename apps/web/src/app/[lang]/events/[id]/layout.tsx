'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { DataStateWrapper, PageLayout, PageHeader } from '@/components/shared';
import { EventHeaderInfo, EventTabs } from '@/components/shared/event';
import { EventActionsDropdown } from '@/components/admin/event-actions-dropdown';
import { useIsFromBfcache, useIsEditor } from '@/hooks';
import { useDraw } from '@/hooks/use-draws';
import type { EventWithRSVPSerialized } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const { data: session } = useSession();
  const t = useTranslations('eventDetails');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isBackNav = useIsFromBfcache();
  const isEditor = useIsEditor();

  const { data: event, isLoading } = useQuery<EventWithRSVPSerialized>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch event');
      return res.json();
    },
  });

  // Fetch draw data for editor actions dropdown
  const { data: draw } = useDraw(eventId);

  return (
    <PageLayout nav={<HomeAdaptiveNav />}>
      <DataStateWrapper
        isLoading={isLoading}
        data={event}
        loadingMessage={t('loadingEvent')}
        emptyMessage={t('eventNotFound')}
      >
        {(event) => (
          <div className="space-y-6">
            <PageHeader
              title={event.title || t('untitledEvent')}
              description={
                <EventHeaderInfo event={event} locale={locale} showStatus={!!isEditor} />
              }
              showBackButton
              backButtonHref="/events"
              backButtonLabel={t('backToEvents')}
              action={
                isEditor ? (
                  <EventActionsDropdown
                    event={{
                      id: event.id,
                      state: event.state as 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED',
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

            <EventTabs eventId={eventId} basePath="/events" tabs={['details', 'draw', 'results']} />

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
    </PageLayout>
  );
}
