import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { EventWithRSVP, EventWithPlayersSerialized, CreateEventDto } from '@padel/types';
import { TIMINGS } from '@/lib/constants';
import { useAuthFetch } from './use-api';

interface UseEventsOptions {
  from?: string;
  to?: string;
  queryKey?: string[];
}

/**
 * Hook to fetch events with optional filters
 * Note: Backend automatically determines access to unpublished events based on user roles from JWT
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { data: session } = useSession();
  const authFetch = useAuthFetch();
  const { from, to, queryKey = ['events'] } = options;

  // Backend filters results by role (editors see DRAFT, viewers don't), so we
  // key by a stable role digest rather than the raw access token — otherwise
  // every token refresh busts the cache and refetches the same list.
  const roleKey = (session?.user?.roles ?? []).slice().sort().join(',') || 'anon';

  return useQuery<EventWithRSVP[]>({
    queryKey: [...queryKey, roleKey, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const path = `/events${params.toString() ? `?${params.toString()}` : ''}`;
      return authFetch.get<EventWithRSVP[]>(path);
    },
  });
}

/**
 * Hook to fetch upcoming events (from today onwards)
 */
export function useUpcomingEvents(queryKey: string[] = ['events']) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = today.toISOString();

  return useEvents({ from, queryKey });
}

/**
 * Hook to fetch past events (before today)
 */
export function usePastEvents(queryKey: string[] = ['past-events']) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const to = today.toISOString();

  return useEvents({ to, queryKey });
}

/**
 * Hook to fetch admin events
 * Note: Backend automatically includes unpublished events for admin/editor users based on JWT roles
 */
export function useAdminEvents() {
  return useEvents({ queryKey: ['admin-events'] });
}

/**
 * Hook to fetch a single event by ID
 * Note: Backend automatically determines access to unpublished events based on user roles from JWT
 */
export function useEventDetails(eventId: string) {
  const authFetch = useAuthFetch();

  return useQuery<EventWithPlayersSerialized>({
    // queryKey intentionally excludes the access token — authorization is
    // handled inside the fetch layer, and including the token causes a cache
    // miss on every token rotation which re-triggers the request needlessly.
    queryKey: ['event', eventId],
    queryFn: async () => {
      return authFetch.get(`/events/${eventId}`);
    },
  });
}

/**
 * Hook to handle RSVP mutations
 */
export function useRSVP(queryKeysToInvalidate: string[][] = [['events']]) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'IN' | 'OUT' }) => {
      return authFetch.post<{ message?: string }>(`/events/${eventId}/rsvp`, { status });
    },
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      toast.success(data?.message || 'RSVP updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update RSVP');
    },
  });
}

/**
 * Hook to freeze event RSVPs
 */
export function useFreezeEvent(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/events/${eventId}/freeze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Event RSVPs frozen successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to freeze event');
    },
  });
}

/**
 * Hook to unfreeze event RSVPs
 */
export function useUnfreezeEvent(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/events/${eventId}/unfreeze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Event reopened successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reopen event');
    },
  });
}

/**
 * Hook to publish event
 */
export function usePublishEvent(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Event published successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish event');
    },
  });
}

/**
 * Hook to delete event
 */
export function useDeleteEvent(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.delete(`/events/${eventId}`);
    },
    onSuccess: async () => {
      // Invalidate and wait for refetch to complete before navigation
      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Event deleted successfully');

      // Small delay to ensure the UI updates with fresh data
      await new Promise((resolve) => setTimeout(resolve, TIMINGS.UI_SETTLE_MS));

      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });
}

/**
 * Hook to remove a player from an event (admin only)
 */
export function useRemovePlayerFromEvent(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (playerId: string) => {
      return authFetch.delete(`/events/${eventId}/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Player removed from event successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove player from event');
    },
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateEventDto) => {
      return authFetch.post<{ id: string }>('/events', data);
    },
    onSuccess: async (data) => {
      // Invalidate admin events list
      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });

      // Small delay to ensure backend transaction is committed
      await new Promise((resolve) => setTimeout(resolve, TIMINGS.CACHE_SETTLE_MS));

      // Navigate to the newly created event
      router.push(`/admin/events/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: Partial<CreateEventDto>) => {
      return authFetch.patch(`/events/${eventId}`, data);
    },
    onSuccess: async () => {
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
        queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
      ]);

      toast.success('Event updated successfully');
      router.push(`/admin/events/${eventId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
}
