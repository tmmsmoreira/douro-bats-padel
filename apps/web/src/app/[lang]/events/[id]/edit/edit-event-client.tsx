'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { EventForm } from '@/components/admin/event-form';
import { PageHeader } from '@/components/shared/layout/page-header';
import { EditorGuard } from '@/components/shared/editor-guard';
import { useEventDetails } from '@/hooks';

export function EditEventClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('editEventPage');

  // Shares the ['event', eventId] cache entry with the rest of the event
  // surface, so we don't refetch on navigation from the event page.
  const { data: event, isLoading } = useEventDetails(eventId);

  const eventEndTime = event?.endsAt ? new Date(event.endsAt) : null;
  const hasEventPassed = eventEndTime ? eventEndTime < new Date() : false;
  const canEdit =
    !hasEventPassed ||
    event?.state === 'DRAFT' ||
    event?.state === 'OPEN' ||
    event?.state === 'FROZEN';
  const cannotEdit = !canEdit;

  useEffect(() => {
    if (cannotEdit && event) {
      router.push(`/${locale}/events/${eventId}`);
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

  const formData = {
    title: event.title ?? undefined,
    // API returns dates as ISO strings; EventForm expects `Date` objects.
    date: new Date(event.date),
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
    venueId: event.venueId || event.venue?.id || '',
    courtIds: event.eventCourts?.map((ec) => ec.courtId) || [],
    capacity: event.capacity,
    rsvpOpensAt: new Date(event.rsvpOpensAt),
    rsvpClosesAt: new Date(event.rsvpClosesAt),
    tierRules: event.tierRules
      ? {
          masterCount: event.tierRules.masterCount,
          masterPercentage: event.tierRules.masterPercentage,
          mastersTimeSlot: event.tierRules.mastersTimeSlot
            ? {
                startsAt: event.tierRules.mastersTimeSlot.startsAt,
                endsAt: event.tierRules.mastersTimeSlot.endsAt,
                courtIds: event.tierRules.mastersTimeSlot.courtIds || [],
              }
            : undefined,
          explorersTimeSlot: event.tierRules.explorersTimeSlot
            ? {
                startsAt: event.tierRules.explorersTimeSlot.startsAt,
                endsAt: event.tierRules.explorersTimeSlot.endsAt,
                courtIds: event.tierRules.explorersTimeSlot.courtIds || [],
              }
            : undefined,
        }
      : undefined,
  };

  return (
    <EditorGuard>
      <div className="space-y-6">
        <PageHeader
          title={t('title')}
          description={t('description')}
          showBackButton
          backButtonHref={`/events/${eventId}`}
          backButtonLabel={t('backToEvent')}
        />
        <EventForm eventId={eventId} initialData={formData} />
      </div>
    </EditorGuard>
  );
}
