'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EventForm } from '@/components/admin/event-form';
import { use, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('editEventPage');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  // Check if event has passed - redirect to event details if it has
  // DRAFT events can always be edited regardless of date
  const eventEndTime = event?.endsAt ? new Date(event.endsAt) : null;
  const hasEventPassed = eventEndTime ? eventEndTime < new Date() : false;
  const cannotEdit = hasEventPassed && event?.state !== 'DRAFT';

  // Use useEffect to handle navigation to avoid setState during render
  // This must be called before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (cannotEdit && event) {
      router.push(`/${locale}/admin/events/${eventId}`);
    }
  }, [cannotEdit, event, router, locale, eventId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-destructive">{t('eventNotFound')}</p>
        </div>
      </div>
    );
  }

  if (cannotEdit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('cannotEditPastEvents')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton
        backButtonHref={`/admin/events/${eventId}`}
        backButtonLabel={t('backToEvent')}
      />
      <EventForm eventId={eventId} initialData={event} />
    </div>
  );
}
