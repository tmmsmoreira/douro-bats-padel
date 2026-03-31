'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { DataStateWrapper, PageHeader } from '@/components/shared';
import { EventHeaderInfo, EventTabs } from '@/components/shared/event';
import { EventActionsDropdown } from '@/components/admin/event-actions-dropdown';
import { useAuthFetch } from '@/hooks';
import type { EventWithRSVPSerialized } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminEventLayout({
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
  const router = useRouter();
  const authFetch = useAuthFetch();

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

  // Fetch draw data
  const { data: draw } = useQuery<{ id: string; eventId: string } | null>({
    queryKey: ['draw', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get(`/draws/events/${eventId}`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken && !!event,
  });

  return (
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
              <EventHeaderInfo
                event={event}
                locale={locale}
                showStatus={true}
                actions={
                  <EventActionsDropdown
                    event={event}
                    draw={draw ?? null}
                    onDeleteSuccess={() => router.push('/admin')}
                  />
                }
              />
            }
            showBackButton
            backButtonHref="/admin"
            backButtonLabel={t('backToEvents')}
          />

          <EventTabs
            eventId={eventId}
            basePath="/admin/events"
            tabs={['details', 'draw', 'results']}
          />

          {children}
        </div>
      )}
    </DataStateWrapper>
  );
}
