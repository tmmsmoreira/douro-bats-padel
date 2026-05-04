import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Locale } from '@padel/types';
import { useAuthFetch } from './use-api';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  profilePhoto: string | null;
  roles: string[];
  emailVerified: boolean;
  preferredLanguage: Locale;
  createdAt: string;
  profileCompleted: boolean;
  player: {
    id: string;
    rating: number;
    tier: string;
    status: string;
    notificationsPaused: boolean;
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
  notificationsPaused?: boolean;
  preferredLanguage?: Locale;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return authFetch.patch<UserProfile>('/auth/profile', data);
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
