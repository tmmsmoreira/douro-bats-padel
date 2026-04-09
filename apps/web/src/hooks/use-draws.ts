import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthFetch } from './use-api';
import type { Draw } from '@/components/shared/draw';

/**
 * Hook to generate a draw for an event
 */
export function useGenerateDraw(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (data: {
      constraints: {
        avoidRecentSessions: number;
        balanceStrength: boolean;
        allowTierMixing: boolean;
      };
      selectedCourts: {
        masters: string[];
        explorers: string[];
      };
    }) => {
      return authFetch.post(`/draws/events/${eventId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw generated successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate draw');
    },
  });
}

/**
 * Hook to update a draw assignment (team composition)
 */
export function useUpdateAssignment(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (data: { assignmentId: string; teamA: string[]; teamB: string[] }) => {
      return authFetch.patch(`/draws/assignments/${data.assignmentId}`, {
        teamA: data.teamA,
        teamB: data.teamB,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      toast.success('Assignment updated successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update assignment');
    },
  });
}

/**
 * Hook to publish a draw
 */
export function usePublishDraw(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/draws/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw published successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish draw');
    },
  });
}

/**
 * Hook to unpublish a draw
 */
export function useUnpublishDraw(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/draws/events/${eventId}/unpublish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw unpublished successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unpublish draw');
    },
  });
}

/**
 * Hook to delete a draw
 */
export function useDeleteDraw(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.delete(`/draws/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw deleted successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete draw');
    },
  });
}

/**
 * Hook to fetch a draw for an event
 */
export function useDraw(eventId: string) {
  const authFetch = useAuthFetch();

  return useQuery<Draw | null>({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      try {
        return await authFetch.get(`/draws/events/${eventId}`);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('404')) return null;
        throw e;
      }
    },
    retry: false,
  });
}
