'use client';

import { use } from 'react';
import { EventDetails } from '@/components/shared/event/event-details';
import { useIsEditor } from '@/hooks';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isEditor = useIsEditor();
  return <EventDetails eventId={id} isEditor={!!isEditor} />;
}
