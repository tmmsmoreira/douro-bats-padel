import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAuthFetch } from './use-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  profilePhoto: string | null;
  roles: string[];
  emailVerified: boolean;
  createdAt: string;
  player: {
    id: string;
    rating: number;
    tier: string;
    status: string;
    createdAt: string;
  } | null;
}

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  const { data: session } = useSession();
  const authFetch = useAuthFetch();

  return useQuery<UserProfile>({
    queryKey: ['profile', session?.accessToken],
    queryFn: () => authFetch.get('/auth/me'),
    enabled: !!session?.accessToken,
  });
}

interface UpdateProfileData {
  name?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!session?.accessToken) {
        throw new Error('No access token');
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || res.statusText);
      }

      return res.json();
    },
    onSuccess: async (data) => {
      // Update the session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          ...data,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
