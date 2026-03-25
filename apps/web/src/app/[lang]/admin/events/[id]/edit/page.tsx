'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EventForm } from '@/components/admin/event-form';
import { use, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import type { TierRules } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface EventCourt {
  id: string;
  courtId: string;
  court: {
    id: string;
    label: string;
  };
}

// Extended type for API response that includes eventCourts
interface EventApiResponse {
  id: string;
  title: string | null;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  venueId?: string | null;
  capacity: number;
  state: string;
  rsvpOpensAt: Date;
  rsvpClosesAt: Date;
  tierRules?: TierRules | null;
  eventCourts?: EventCourt[];
  venue?: {
    id: string;
    name: string;
  };
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('editEventPage');

  const { data: event, isLoading } = useQuery<EventApiResponse>({
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

  // Check if event can be edited
  // Allow editing if:
  // 1. Event hasn't passed yet, OR
  // 2. Event was never published (state is DRAFT, OPEN, or FROZEN), OR
  // 3. Event was never drawn (state is DRAFT, OPEN, or FROZEN)
  const eventEndTime = event?.endsAt ? new Date(event.endsAt) : null;
  const hasEventPassed = eventEndTime ? eventEndTime < new Date() : false;
  const canEdit =
    !hasEventPassed ||
    event?.state === 'DRAFT' ||
    event?.state === 'OPEN' ||
    event?.state === 'FROZEN';
  const cannotEdit = !canEdit;

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

  // Transform event data to match EventFormData interface
  const formData = event
    ? {
        title: event.title ?? undefined,
        date: event.date,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        venueId: event.venueId || event.venue?.id || '',
        courtIds: event.eventCourts?.map((ec) => ec.courtId) || [],
        capacity: event.capacity,
        rsvpOpensAt: event.rsvpOpensAt,
        rsvpClosesAt: event.rsvpClosesAt,
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
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton
        backButtonHref={`/admin/events/${eventId}`}
        backButtonLabel={t('backToEvent')}
      />
      <EventForm eventId={eventId} initialData={formData} />
    </div>
  );
}
