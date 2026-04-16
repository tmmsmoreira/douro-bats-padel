import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthFetch } from './use-api';

interface CreateInvitationDto {
  email: string;
  name: string;
  expiresInDays: number;
}

/**
 * Hook to create an invitation
 */
export function useCreateInvitation(onSuccessCallback?: (data: unknown) => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (dto: CreateInvitationDto) => {
      return authFetch.post<unknown>('/invitations', dto);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Invitation created successfully');
      onSuccessCallback?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invitation');
    },
  });
}

/**
 * Hook to revoke an invitation
 */
export function useRevokeInvitation(playerId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return authFetch.delete<void>(`/invitations/${invitationId}`);
    },
    onSuccess: async () => {
      toast.success('Invitation revoked successfully');
      // Wait for both queries to be invalidated before navigating
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['player', playerId] }),
        queryClient.invalidateQueries({ queryKey: ['players'] }),
      ]);
      onSuccessCallback?.();
    },
    onError: () => {
      toast.error('Failed to revoke invitation');
    },
  });
}

/**
 * Hook to resend an invitation
 */
export function useResendInvitation() {
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return authFetch.post<void>(`/invitations/${invitationId}/resend`);
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });
}
