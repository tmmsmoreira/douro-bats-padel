import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { EventWithRSVP } from '@padel/types';
import { useAuthFetch } from './use-api';

interface UseEventsOptions {
  from?: string;
  to?: string;
  includeUnpublished?: boolean;
  queryKey?: string[];
}

/**
 * Hook to fetch events with optional filters
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { data: session } = useSession();
  const authFetch = useAuthFetch();
  const { from, to, includeUnpublished = false, queryKey = ['events'] } = options;

  return useQuery({
    queryKey: [...queryKey, session?.accessToken, from, to, includeUnpublished],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (includeUnpublished) params.append('includeUnpublished', 'true');

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
 * Hook to fetch admin events (includes unpublished)
 */
export function useAdminEvents() {
  return useEvents({ includeUnpublished: true, queryKey: ['admin-events'] });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEventDetails(eventId: string, includeUnpublished = false) {
  const { data: session } = useSession();
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['event', eventId, session?.accessToken, includeUnpublished],
    queryFn: async () => {
      const params = includeUnpublished ? '?includeUnpublished=true' : '';
      return authFetch.get(`/events/${eventId}${params}`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Event deleted successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });
}
