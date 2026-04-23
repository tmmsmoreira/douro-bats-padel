import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { EventDetails } from '@/components/shared/event/event-details';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const roles = session?.user?.roles ?? [];
  const isEditor = roles.includes('ADMIN');

  const eventDescriptor = queries.event(id);
  await queryClient.prefetchQuery({
    queryKey: eventDescriptor.queryKey,
    queryFn: () => serverApiGet(eventDescriptor.path, session),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetails eventId={id} isEditor={isEditor} />
    </HydrationBoundary>
  );
}
