import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { EditVenueClient } from './edit-venue-client';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries } from '@/lib/query/queries';

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const queryClient = getQueryClient();

  const venueDescriptor = queries.venue(id);
  await queryClient.prefetchQuery({
    queryKey: venueDescriptor.queryKey,
    queryFn: () => serverApiGet(venueDescriptor.path, session),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditVenueClient venueId={id} />
    </HydrationBoundary>
  );
}
