import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { CreateVenueDto, UpdateVenueDto, Venue } from '@padel/types';
import { useAuthFetch } from './use-api';

/**
 * Hook to create a new venue
 */
export function useCreateVenue() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateVenueDto) => {
      return authFetch.post<{ id: string }>('/venues', data);
    },
    onSuccess: async () => {
      // Invalidate venues list
      await queryClient.invalidateQueries({ queryKey: ['venues'] });

      toast.success('Venue created successfully');
      router.push('/admin/venues');
      // Stay pending through navigation so the submit button keeps its loading state
      // until the caller unmounts. router.push is fire-and-forget, so without this the
      // button flashes back to its idle state between isPending=false and the new route mounting.
      await new Promise<never>(() => {});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create venue');
    },
  });
}

/**
 * Hook to update an existing venue
 */
export function useUpdateVenue(venueId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: UpdateVenueDto) => {
      return authFetch.patch(`/venues/${venueId}`, data);
    },
    onSuccess: async () => {
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['venues'] }),
        queryClient.invalidateQueries({ queryKey: ['venue', venueId] }),
      ]);

      toast.success('Venue updated successfully');
      router.push('/admin/venues');
      await new Promise<never>(() => {});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update venue');
    },
  });
}

/**
 * Hook to fetch all venues
 */
export function useVenues() {
  const authFetch = useAuthFetch();

  return useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: () => authFetch.get('/venues'),
  });
}

/**
 * Hook to fetch a single venue by ID (with its courts).
 */
export function useVenue(venueId: string) {
  const authFetch = useAuthFetch();

  return useQuery<Venue>({
    queryKey: ['venue', venueId],
    queryFn: () => authFetch.get(`/venues/${venueId}`),
  });
}

/**
 * Hook to delete a venue
 */
export function useDeleteVenue(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (venueId: string) => {
      return authFetch.delete(`/venues/${venueId}`);
    },
    onSuccess: async () => {
      // Invalidate venues list
      await queryClient.invalidateQueries({ queryKey: ['venues'] });

      toast.success('Venue deleted successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete venue');
    },
  });
}
