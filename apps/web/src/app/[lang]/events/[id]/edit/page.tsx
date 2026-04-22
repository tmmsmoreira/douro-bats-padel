import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { EditEventClient } from './edit-event-client';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const eventDescriptor = queries.event(id);
  const venuesDescriptor = queries.venues();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: eventDescriptor.queryKey,
      queryFn: () => serverApiGet(eventDescriptor.path, session),
    }),
    queryClient.prefetchQuery({
      queryKey: venuesDescriptor.queryKey,
      queryFn: () => serverApiGet(venuesDescriptor.path, session),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditEventClient eventId={id} />
    </HydrationBoundary>
  );
}
