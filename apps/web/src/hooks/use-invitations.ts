import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (dto: CreateInvitationDto) => {
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create invitation');
      }
      return res.json();
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
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`${API_URL}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to revoke invitation');
      }
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
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`${API_URL}/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to resend invitation');
      }
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });
}
