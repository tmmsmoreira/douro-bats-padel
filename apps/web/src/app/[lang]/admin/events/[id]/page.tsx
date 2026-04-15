'use client';

import { use } from 'react';
import { EventDetails } from '@/components/admin/event-details';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventDetails eventId={id} />;
}
