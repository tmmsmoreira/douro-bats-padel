'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { DataStateWrapper, PageLayout, PageHeader } from '@/components/shared';
import { EventHeaderInfo, EventTabs } from '@/components/shared/event';
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

  return (
    <PageLayout nav={<HomeAdaptiveNav />} showFooter={false}>
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
              description={<EventHeaderInfo event={event} locale={locale} showStatus={false} />}
              showBackButton
              backButtonHref="/"
              backButtonLabel={t('backToEvents')}
            />

            <EventTabs eventId={eventId} basePath="/events" tabs={['details', 'draw', 'results']} />

            {children}
          </div>
        )}
      </DataStateWrapper>
    </PageLayout>
  );
}
