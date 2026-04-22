import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared';
import { UnifiedNav } from '@/components/shared/nav/unified-nav';
import { ActionButton } from '@/components/shared/action-button';
import { EventsList } from '@/components/shared/event/events-list';
import { PastEventsList } from '@/components/shared/event/past-events-list';
import { EventsList as AdminEventsList } from '@/components/admin/events-list';
import { getQueryClient } from '@/lib/query/get-query-client';
import { getServerSession, serverApiGet } from '@/lib/query/server-fetch';
import { queries, rolesToRoleKey } from '@/lib/query/queries';

function todayMidnightIso(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

export default async function EventsPage() {
  const session = await getServerSession();
  const roles = session?.user?.roles ?? [];
  const isEditor = roles.includes('EDITOR') || roles.includes('ADMIN');
  const roleKey = rolesToRoleKey(roles);

  const queryClient = getQueryClient();

  if (isEditor) {
    const tAdmin = await getTranslations('admin');
    const adminDescriptor = queries.adminEvents(roleKey);
    await queryClient.prefetchQuery({
      queryKey: adminDescriptor.queryKey,
      queryFn: () => serverApiGet(adminDescriptor.path, session),
    });

    return (
      <PageLayout nav={<UnifiedNav />} maxWidth="4xl">
        <div className="space-y-8">
          <PageHeader
            title={tAdmin('eventsManagement')}
            description={tAdmin('eventsDescription')}
            action={<ActionButton href="/events/new" label={tAdmin('createEvent')} />}
          />
          <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminEventsList />
          </HydrationBoundary>
        </div>
      </PageLayout>
    );
  }

  const tHome = await getTranslations('home');
  const fromIso = todayMidnightIso();
  const toIso = fromIso;
  const upcomingDescriptor = queries.upcomingEvents(roleKey, fromIso);
  const pastDescriptor = queries.pastEvents(roleKey, toIso);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: upcomingDescriptor.queryKey,
      queryFn: () => serverApiGet(upcomingDescriptor.path, session),
    }),
    queryClient.prefetchQuery({
      queryKey: pastDescriptor.queryKey,
      queryFn: () => serverApiGet(pastDescriptor.path, session),
    }),
  ]);

  return (
    <PageLayout nav={<UnifiedNav />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-12">
          <div className="space-y-6">
            <PageHeader
              title={tHome('upcomingEventsTitle')}
              description={tHome('upcomingEventsDescription')}
            />
            <EventsList from={fromIso} />
          </div>
          <div className="space-y-6">
            <PageHeader
              title={tHome('pastEventsTitle')}
              description={tHome('pastEventsDescription')}
            />
            <PastEventsList to={toIso} />
          </div>
        </div>
      </HydrationBoundary>
    </PageLayout>
  );
}
